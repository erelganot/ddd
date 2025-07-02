
import React, { useState, useEffect } from "react";
// Switch to Participant entity
import { Participant } from "@/api/entities"; 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Users, Phone, Calendar, CheckSquare, Loader2 } from "lucide-react"; // Added Loader2
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 25;

export default function UserManager() {
  const [participants, setParticipants] = useState([]); // Renamed from users
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0); // This would be populated if the API returned a total count

  useEffect(() => {
    loadParticipants(1);
  }, []);

  const loadParticipants = async (page = 1) => {
    if (page === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const offset = (page - 1) * PAGE_SIZE;
      // Fetch from Participant entity with pagination
      const participantData = await Participant.list('-created_date', PAGE_SIZE, offset); 
      setHasMore(participantData.length === PAGE_SIZE);

      if (page === 1) {
        setParticipants(participantData);
        // If Participant.list could return total count, setTotalCount here
      } else {
        setParticipants(prev => [...prev, ...participantData]);
      }
      // Note: A `count()` method on the entity would be ideal here.
      // For now, we'll just show the count of loaded participants.
    } catch (error) {
      console.error("Failed to load participants:", error);
    }
    if (page === 1) setLoading(false);
    else setLoadingMore(false);
  };

  if (loading) {
    return <div className="p-6">Loading participants...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-slate-900">Registered Participants</h3>
        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
          Showing {participants.length} Participants
        </Badge>
      </div>

      {participants.length === 0 && !loading ? ( // Check !loading to ensure it's not just loading for the first time
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Participants Yet</h3>
          <p className="text-slate-600">Participants will appear here after they complete registration</p>
        </div>
      ) : (
        <>
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Participant</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Registration Date</TableHead>
                <TableHead>Terms</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participants.map((participant) => (
                <TableRow key={participant.id} className="hover:bg-slate-50/50">
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={participant.user_image_url} />
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {participant.full_name?.[0]?.toUpperCase() || 'P'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-slate-900">{participant.full_name || 'Unknown'}</p>
                        <p className="text-sm text-slate-600">ID: {participant.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    {participant.phone && (
                      <div className="flex items-center text-sm text-slate-600">
                        <Phone className="w-4 h-4 mr-2" />
                        {participant.phone}
                      </div>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center text-sm text-slate-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      {/* Use registration_completed_date or created_date */}
                      {format(new Date(participant.registration_completed_date || participant.created_date), 'MMM d, yyyy HH:mm')}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    {participant.terms_accepted ? (
                       <Badge className="bg-green-100 text-green-700 flex items-center gap-1">
                         <CheckSquare className="w-3 h-3"/> Accepted
                       </Badge>
                    ) : (
                       <Badge variant="destructive">Not Accepted</Badge>
                    )}
                     {participant.terms_accepted_date && (
                      <p className="text-xs text-slate-500 mt-1">
                        {format(new Date(participant.terms_accepted_date), 'MMM d, yyyy')}
                      </p>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
        {hasMore && (
            <div className="flex justify-center mt-6">
              <Button
                onClick={() => {
                  const nextPage = currentPage + 1;
                  setCurrentPage(nextPage);
                  loadParticipants(nextPage);
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
                  "Load More Participants"
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
