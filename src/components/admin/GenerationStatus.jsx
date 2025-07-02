
import React, { useState, useEffect, useRef } from "react";
import { GeneratedImage } from "@/api/entities";
import { BaseImage } from "@/api/entities";
// Import Participant instead of User
import { Participant } from "@/api/entities"; 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { RefreshCw, Eye, Zap, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { pollSegmindImageStatus } from "@/api/functions";

const ADMIN_MAX_POLL_ATTEMPTS = 50;
const INDIVIDUAL_POLL_CHECK_INTERVAL = 5000; 
const FULL_LIST_REFRESH_INTERVAL = 15000; // Increased interval slightly
const PAGE_SIZE = 25; // Pagination size

export default function GenerationStatus({ onUpdate }) {
  const [generations, setGenerations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshingManually, setRefreshingManually] = useState(false);
  const [pollingState, _setPollingState] = useState({}); // Renamed to use with ref
  const pollingStateRef = useRef(pollingState); // Ref to hold current pollingState

  // Custom setter for pollingState that updates both state and ref
  const setPollingState = (newStateOrCallback) => {
    if (typeof newStateOrCallback === 'function') {
      _setPollingState(prevState => {
        const updatedState = newStateOrCallback(prevState);
        pollingStateRef.current = updatedState;
        return updatedState;
      });
    } else {
      pollingStateRef.current = newStateOrCallback;
      _setPollingState(newStateOrCallback);
    }
  };
  
  const [authError, setAuthError] = useState(false); // This can be removed if all backend is public
  const [selectedGeneration, setSelectedGeneration] = useState(null);
  const [showApiResponses, setShowApiResponses] = useState(false);

  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
        isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    loadInitialGenerations();
    
    const individualPollTimer = setInterval(() => {
      // Use pollingStateRef.current inside the interval callback
      automaticallyPollAllPendingImages(pollingStateRef.current); 
    }, INDIVIDUAL_POLL_CHECK_INTERVAL);

    const fullListRefreshTimer = setInterval(triggerFullListRefresh, FULL_LIST_REFRESH_INTERVAL);
    
    return () => {
      clearInterval(individualPollTimer);
      clearInterval(fullListRefreshTimer);
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleanup on unmount

  const triggerFullListRefresh = async () => {
    if (refreshingManually || !isMounted.current) return; // authError can be removed
    await fetchAndSetGenerations(1, true); // Refresh first page
    if (onUpdate && isMounted.current) onUpdate();
  };

  const loadInitialGenerations = async () => {
    if (!isMounted.current) return;
    setLoading(true);
    await fetchAndSetGenerations(1); 
    if (isMounted.current) setLoading(false);
  };
  
  const fetchAndSetGenerations = async (page = 1, isRefreshing = false) => {
    if (!isMounted.current) return [];
    if(page > 1) setLoadingMore(true);

    try {
      // if (isMounted.current) setAuthError(false); // Can remove setAuthError
      const offset = (page - 1) * PAGE_SIZE;
      
      // Fetch Participants instead of Users
      const [generatedImages, baseImages, participants] = await Promise.all([
        GeneratedImage.list('-created_date', PAGE_SIZE, offset),
        BaseImage.list(),
        Participant.list() // Fetch participants
      ]);

      if (!isMounted.current) return []; 

      const enrichedGenerations = generatedImages.map(gen => ({
        ...gen,
        baseImage: baseImages.find(img => img.id === gen.base_image_id),
        // Link to participant using participant_id
        participant: participants.find(p => p.id === gen.participant_id) 
      }));

      if (isMounted.current) {
        setHasMore(enrichedGenerations.length === PAGE_SIZE);
        if (page === 1) {
            setGenerations(enrichedGenerations);
        } else {
            // Append new data, ensuring no duplicates
            setGenerations(prev => {
                const existingIds = new Set(prev.map(g => g.id));
                const newGens = enrichedGenerations.filter(g => !existingIds.has(g.id));
                return [...prev, ...newGens];
            });
        }
        
        // This logic remains the same, it will just operate on a smaller set of data
        setPollingState(currentLocalPollState => {
            const newPollStateFromDBRefresh = {};
            enrichedGenerations.forEach(genFromDB => {
                const existingLocalEntry = currentLocalPollState[genFromDB.id];
                
                const needsPollingCheck = 
                  (genFromDB.status === 'pending' || genFromDB.status === 'processing' || genFromDB.status === 'queued') ||
                  (genFromDB.status === 'succeeded' && !genFromDB.generated_image_url);
                
                if (needsPollingCheck && genFromDB.poll_url) {
                    newPollStateFromDBRefresh[genFromDB.id] = {
                        attempts: existingLocalEntry?.attempts > (genFromDB.poll_attempts || 0) ? existingLocalEntry.attempts : (genFromDB.poll_attempts || 0),
                        isPollingThisInstant: existingLocalEntry?.isPollingThisInstant || false,
                        lastPollTime: existingLocalEntry?.lastPollTime || 0,
                        entity: genFromDB 
                    };
                } else {
                    // If it doesn't need polling, remove or don't add to local polling state
                    // Or keep it simple and just don't add.
                }
            });
            // console.log("[Admin FG] Polling state updated after DB refresh:", newPollStateFromDBRefresh); // Keep for critical debug
            return newPollStateFromDBRefresh;
        });
      }
      return enrichedGenerations;
    } catch (error) {
      console.error("[CRITICAL] Error in fetchAndSetGenerations:", error);
      // No authError specific handling needed if backend is public
      // if (isMounted.current) {
      //   if (error.message && (error.message.includes('logged in') || error.message.includes('auth') || error.message.includes('Rate limit exceeded'))) {
      //     setAuthError(true);
      //     console.error("[CRITICAL] Authentication or Rate Limit error in admin panel.");
      //   }
      // }
      return [];
    } finally {
        if(isMounted.current) setLoadingMore(false);
    }
  };

  // Modified to accept currentPollingState as an argument
  const automaticallyPollAllPendingImages = async (currentPollingState) => { 
    if (!isMounted.current) { // authError can be removed
      return;
    }
    // console.log("[Admin FG] automaticallyPollAllPendingImages cycle start. Current pollingState:", currentPollingState); // Keep for critical debug

    let imagesPolledThisCycle = 0;
    // Iterate over the passed currentPollingState
    for (const imageId in currentPollingState) { 
        if (!isMounted.current) break;

        const localPollInfo = currentPollingState[imageId];
        const generationEntity = localPollInfo.entity;

        if (!generationEntity) {
            console.warn("[Admin FG] CRITICAL: No entity data for imageId in pollingState:", imageId);
            continue;
        }

        const needsPollingByStatus = 
            (generationEntity.status === 'pending' || generationEntity.status === 'processing' || generationEntity.status === 'queued') ||
            (generationEntity.status === 'succeeded' && !generationEntity.generated_image_url);
        
        const hasPollUrl = !!generationEntity.poll_url;
        const currentAttempts = localPollInfo.attempts || 0;
        const belowMaxAttempts = currentAttempts < ADMIN_MAX_POLL_ATTEMPTS;

        if (needsPollingByStatus && hasPollUrl && belowMaxAttempts && !localPollInfo.isPollingThisInstant) {
            // console.log(`[Admin FG] Attempting to poll image ${generationEntity.id} (status: ${generationEntity.status}, local attempts: ${currentAttempts})`); // Verbose
            pollSpecificImageFrontend(generationEntity, currentAttempts);
            imagesPolledThisCycle++;
            await new Promise(resolve => setTimeout(resolve, 200)); 
        } else if (needsPollingByStatus && hasPollUrl && !belowMaxAttempts) {
            console.warn(`[Admin FG] CRITICAL: Image ${generationEntity.id} reached max poll attempts (${currentAttempts}/${ADMIN_MAX_POLL_ATTEMPTS})`);
        }
    }
    // if (imagesPolledThisCycle > 0) {
    //   console.log(`[Admin FG] Polled ${imagesPolledThisCycle} images this cycle.`); // Verbose
    // }
  };

  const pollSpecificImageFrontend = async (genToPoll, currentLocalAttempts) => {
    if (!genToPoll || !genToPoll.poll_url || !isMounted.current) {
        console.warn("[Admin FG] CRITICAL: pollSpecificImageFrontend pre-condition fail for ID:", genToPoll?.id);
        return;
    }
    
    // Check against the ref's current value
    if (pollingStateRef.current[genToPoll.id]?.isPollingThisInstant) {
        // console.log(`[Admin FG] Image ${genToPoll.id} is already being polled. Skipping duplicate poll.`); // Verbose
        return;
    }

    if (isMounted.current) {
        setPollingState(prev => ({ 
            ...prev, 
            [genToPoll.id]: { 
                ...(prev[genToPoll.id] || { attempts: 0, entity: genToPoll }), // Ensure entry exists
                isPollingThisInstant: true, 
                lastPollTime: Date.now(),
            } 
        }));
    }

    try {
      // console.log(`[Admin FG] Calling backend pollSegmindImageStatus for ${genToPoll.id}`); // Verbose
      const response = await pollSegmindImageStatus({
        generated_image_record_id: genToPoll.id,
        poll_url: genToPoll.poll_url 
      });
      const backendResponseData = response.data;
      // console.log(`[Admin FG] Backend poll response for ${genToPoll.id}:`, backendResponseData); // Verbose

      if (!isMounted.current) return;

      if (backendResponseData && backendResponseData.success) {
        const updatedStatusFromBackend = backendResponseData.status;
        const updatedPollAttemptsFromBackend = backendResponseData.poll_attempts;
        const updatedGeneratedUrlFromBackend = backendResponseData.generated_url;
        const isFinalFromBackend = backendResponseData.is_final;

        setGenerations(prevGens => prevGens.map(g => {
          if (g.id === genToPoll.id) {
            return {
              ...g,
              status: updatedStatusFromBackend,
              poll_attempts: updatedPollAttemptsFromBackend, 
              generated_image_url: updatedGeneratedUrlFromBackend || g.generated_image_url,
              last_poll_response: backendResponseData.raw_response || backendResponseData,
            };
          }
          return g;
        }));
        
        setPollingState(prev => ({
            ...prev,
            [genToPoll.id]: {
                ...(prev[genToPoll.id] || { attempts: 0 }), // Ensure entry exists
                attempts: updatedPollAttemptsFromBackend, 
                entity: { 
                    ...(prev[genToPoll.id]?.entity || genToPoll),
                    status: updatedStatusFromBackend,
                    poll_attempts: updatedPollAttemptsFromBackend,
                    generated_image_url: updatedGeneratedUrlFromBackend || prev[genToPoll.id]?.entity?.generated_image_url,
                    last_poll_response: backendResponseData.raw_response || backendResponseData,
                }
            }
        }));

        if (isFinalFromBackend && onUpdate && isMounted.current) onUpdate(); 
      } else {
        console.error("[CRITICAL] Backend poll failed for", genToPoll.id, ":", backendResponseData?.error || "Unknown backend error");
      }
    } catch (error) {
      console.error("[CRITICAL] Error calling backend poll function for", genToPoll.id, ":", error);
      
      // If it's a 404 error (expired poll URL), stop polling this image
      if (error.message && error.message.includes('404')) {
        console.warn(`[Admin FG] Poll URL expired for ${genToPoll.id}, removing from polling queue`);
        setPollingState(prev => {
          const newState = { ...prev };
          delete newState[genToPoll.id]; // Remove from polling queue
          return newState;
        });
        
        // Update the generation status to show it failed due to expiration
        setGenerations(prevGens => prevGens.map(g => {
          if (g.id === genToPoll.id) {
            return {
              ...g,
              status: "failed",
              last_poll_response: { error: "Poll URL expired (404)" },
            };
          }
          return g;
        }));
      }
      // No authError specific handling
      // if (isMounted.current && (error.message && (error.message.includes('logged in') || error.message.includes('auth')) || error.message.includes('401') || error.message.includes('Rate limit exceeded'))) {
      //   setAuthError(true);
      // }
    } finally {
      if (isMounted.current) {
        setPollingState(prev => ({ 
            ...prev, 
            [genToPoll.id]: { 
                ...(prev[genToPoll.id] || { attempts: 0, entity: genToPoll }),
                isPollingThisInstant: false 
            } 
        }));
      }
    }
  };


  const refreshListManually = async () => {
    if (!isMounted.current) return;
    setRefreshingManually(true);
    setCurrentPage(1); // Reset to first page
    await fetchAndSetGenerations(1, true);
    if (onUpdate && isMounted.current) onUpdate();
    if (isMounted.current) setRefreshingManually(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
      case 'queued':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'processing':
        return <Zap className="w-4 h-4 text-blue-600" />;
      case 'completed':
      case 'succeeded': 
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
      case 'queued':
        return "bg-yellow-100 text-yellow-700";
      case 'processing':
        return "bg-blue-100 text-blue-700";
      case 'completed':
      case 'succeeded':
        return "bg-green-100 text-green-700";
      case 'failed':
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading && generations.length === 0) {
    return <div className="p-6 flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-slate-900">Image Generation Status</h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-600" title={`Poll Interval: ${INDIVIDUAL_POLL_CHECK_INTERVAL/1000}s / List Refresh: ${FULL_LIST_REFRESH_INTERVAL/1000}s`}>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Auto-Update Active
          </div>
          <Button
            onClick={refreshListManually}
            disabled={refreshingManually || loading }
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshingManually || loading ? 'animate-spin' : ''}`} />
            Refresh List
          </Button>
        </div>
      </div>

      {/* This block can be removed if auth is fully public */}
      {/* {authError && ( 
          <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
            <span className="font-medium">Auth/Rate Limit Error!</span> Try refreshing.
            <Button onClick={() => { if (isMounted.current) { setAuthError(false); loadInitialGenerations(); }}} variant="link" className="ml-2 text-red-700">Retry</Button>
          </div>
      )} */}

      {generations.length === 0 && !loading ? (
        <div className="text-center py-12">
          <Zap className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Generations Yet</h3>
          <p className="text-slate-600">Generations will appear here.</p>
        </div>
      ) : (
        <>
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Participant</TableHead>
                  <TableHead>Base Image</TableHead>
                  <TableHead>Status & Retries</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-40">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {generations.map((generation) => {
                  // Use pollingStateRef.current for display to get the latest attempts
                  const localPollInfo = pollingStateRef.current[generation.id];
                  const displayAttempts = localPollInfo?.attempts ?? generation.poll_attempts ?? 0;
                  const isPollingIndicator = localPollInfo?.isPollingThisInstant;

                  const needsPollingByStatus = (
                      (generation.status !== 'completed' && generation.status !== 'failed' && generation.status !== 'succeeded') ||
                      (generation.status === 'succeeded' && !generation.generated_image_url)
                  );
                  const canStillPoll = generation.poll_url && displayAttempts < ADMIN_MAX_POLL_ATTEMPTS;
                  
                  return (
                  <TableRow key={generation.id} className="hover:bg-slate-50/50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        {/* Display participant info */}
                        {generation.participant && (
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={generation.participant.user_image_url} />
                            <AvatarFallback className="bg-blue-100 text-blue-600">
                              {generation.participant?.full_name?.[0]?.toUpperCase() || 'P'}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div>
                          <p className="font-medium text-slate-900">
                            {generation.participant?.full_name || 'Unknown Participant'}
                          </p>
                          <p className="text-sm text-slate-600">
                            ID: {generation.participant?.id?.slice(0,8) || 'N/A'}...
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center space-x-3">
                        {generation.baseImage && (
                          <img
                            src={generation.baseImage.image_url}
                            alt={generation.baseImage.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        )}
                        <div>
                          <p className="font-medium text-slate-900">
                            {generation.baseImage?.name || 'Unknown Base'}
                          </p>
                          <p className="text-sm text-slate-600">
                            ID: {generation.base_image_id?.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(generation.status)}
                        <Badge className={getStatusColor(generation.status)}>
                          {generation.status}
                        </Badge>
                      </div>
                      {isPollingIndicator && (
                          <span className="text-xs text-blue-600 animate-pulse ml-1">(polling...)</span>
                      )}
                      {needsPollingByStatus && generation.poll_url && (
                        <p className="text-xs text-slate-500 mt-1">
                            Retries: {displayAttempts}/{ADMIN_MAX_POLL_ATTEMPTS}
                            {!canStillPoll && displayAttempts >= ADMIN_MAX_POLL_ATTEMPTS && ' (max retries)'}
                        </p>
                      )}
                      {generation.api_request_id && (
                        <p className="text-xs text-slate-500 mt-1 truncate max-w-[150px]" title={generation.api_request_id}>
                          Req: {generation.api_request_id.startsWith('SegmindError') || generation.api_request_id.startsWith('InternalError') ? generation.api_request_id : generation.api_request_id.slice(0,20) + '...'}
                        </p>
                      )}
                    </TableCell>

                    <TableCell>
                      <p className="text-sm text-slate-600">
                        {format(new Date(generation.created_date), 'MMM d, yyyy HH:mm')}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if(isMounted.current) {
                              const freshestGen = generations.find(g => g.id === generation.id) || generation;
                              setSelectedGeneration(freshestGen);
                              setShowApiResponses(true);
                            }
                          }}
                          className="gap-1 px-2"
                          title="View API Responses"
                        >
                          <Eye className="w-3 h-3" />
                          Log
                        </Button>
                        {generation.user_image_url && ( // This is participant's input image
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => window.open(generation.user_image_url, '_blank')}
                            title="View Participant Image"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                        {generation.generated_image_url && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => window.open(generation.generated_image_url, '_blank')}
                            className="bg-green-50 border-green-200 hover:bg-green-100"
                            title="View Generated Image"
                          >
                            <Eye className="w-4 h-4 text-green-600" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              </TableBody>
            </Table>
          </Card>
          
          {hasMore && (
            <div className="flex justify-center mt-6">
              <Button
                onClick={() => {
                  const nextPage = currentPage + 1;
                  setCurrentPage(nextPage);
                  fetchAndSetGenerations(nextPage);
                }}
                disabled={loadingMore}
                variant="outline"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load More"
                )}
              </Button>
            </div>
          )}

          {showApiResponses && selectedGeneration && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">API Response History</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { if (isMounted.current) setShowApiResponses(false)}}
                    >
                      Close
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Generation ID: {selectedGeneration.id}
                  </p>
                   {selectedGeneration.participant && (
                     <p className="text-sm text-gray-500 mt-1">
                       Participant: {selectedGeneration.participant.full_name} (ID: {selectedGeneration.participant.id.slice(0,8)}...)
                     </p>
                   )}
                </div>

                <div className="p-6 overflow-y-auto flex-grow">
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Current Status</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Our Status:</span> {selectedGeneration.status}
                        </div>
                        <div>
                          <span className="font-medium">Poll Attempts (DB):</span> {selectedGeneration.poll_attempts || 0}/{ADMIN_MAX_POLL_ATTEMPTS}
                        </div>
                        <div>
                          <span className="font-medium">Generated URL:</span>
                          {selectedGeneration.generated_image_url ? (
                            <a href={selectedGeneration.generated_image_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1 break-all">
                              View Image
                            </a>
                          ) : (
                            <span className="text-gray-500 ml-1">Not available</span>
                          )}
                        </div>
                         <div>
                          <span className="font-medium">Poll URL:</span>
                          {selectedGeneration.poll_url ? (
                            <span className="text-gray-500 ml-1 break-all" title={selectedGeneration.poll_url}>{selectedGeneration.poll_url.slice(0,70)}...</span>
                          ) : (
                            <span className="text-gray-500 ml-1">Not available</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {selectedGeneration.last_poll_response && (
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 mb-2">Latest Segmind Response (from DB)</h4>
                        <pre className="bg-white p-3 rounded border text-xs overflow-x-auto whitespace-pre-wrap">
                          {JSON.stringify(selectedGeneration.last_poll_response, null, 2)}
                        </pre>
                      </div>
                    )}

                    {selectedGeneration.segmind_responses && selectedGeneration.segmind_responses.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Complete Response History (from DB, {selectedGeneration.segmind_responses.length} entries)</h4>
                        <div className="space-y-4">
                          {selectedGeneration.segmind_responses.slice().reverse().map((resp, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-700">
                                  {resp.type === 'initial_generation' ? '🚀 Initial' : resp.type === 'poll_response' ? '🔄 Poll' : resp.type === 'poll_error' ? '❌ API Err' : resp.type === 'initial_error' ? '💥 Init Err': '⚠️ Sys Err'} #{selectedGeneration.segmind_responses.length - index}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {resp.timestamp ? new Date(resp.timestamp).toLocaleString() : 'N/A'}
                                </span>
                              </div>
                              <div className="text-xs text-gray-600 mb-2">
                                HTTP Status: {resp.status_code}
                                {typeof resp.attempt_number === 'number' && <span className="ml-2">Attempt (DB): {resp.attempt_number}</span>}
                                {resp.poll_url && <span className="ml-2 truncate" title={resp.poll_url}>Poll URL: {resp.poll_url.slice(0,50)}...</span>}
                              </div>
                              <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto whitespace-pre-wrap">
                                {JSON.stringify(resp.response, null, 2)}
                              </pre>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {(!selectedGeneration.segmind_responses || selectedGeneration.segmind_responses.length === 0) && (
                      <p className="text-sm text-gray-500">No detailed API responses logged in DB for this generation yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
