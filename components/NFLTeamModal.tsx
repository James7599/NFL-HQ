'use client';

import { useState } from 'react';
import { X, ChevronDown, ChevronRight, Shield, Info } from 'lucide-react';
import { TeamData } from '@/data/teams';
import { DraftBoardPick } from '@/lib/draftPicksUtils';
import { protectionEngine } from '@/lib/protectionEngine';

interface NBATeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: TeamData;
  picks: DraftBoardPick[];
  record?: string;
}

export default function NBATeamModal({ isOpen, onClose, team, picks, record }: NBATeamModalProps) {
  const [expandedPick, setExpandedPick] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleTradeDetails = (pickId: string) => {
    setExpandedPick(expandedPick === pickId ? null : pickId);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg max-w-2xl w-full max-h-[calc(100vh-200px)] overflow-y-auto shadow-2xl animate-scaleIn" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between sticky top-0 bg-white z-10">
          <a
            href={`/teams/${team.id}/draft-picks`}
            className="flex items-center gap-2 sm:gap-4 hover:opacity-80 transition-opacity"
          >
            <img
              src={team.logoUrl}
              alt={team.name}
              className="object-contain w-10 h-10 sm:w-12 sm:h-12"
            />
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900 hover:text-[#0050A0] transition-colors">
                {team.fullName}
                {record && <span className="text-sm sm:text-lg text-gray-600 ml-2">({record})</span>}
              </h2>
            </div>
          </a>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Draft Picks */}
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">
              2026 NBA Draft Picks: {picks.length}
            </h3>
            <div className="space-y-2">
              {picks.map((pick, index) => {
                const hasTradeHistory = pick.isTraded || pick.isSwapRights;
                const hasTradeDetails = hasTradeHistory && pick.protections;
                const uniquePickId = `${pick.round}-${pick.pickNumber}-${index}`;
                const isExpanded = expandedPick === uniquePickId;

                // Evaluate protection if present
                const protectionSummary = pick.protections && pick.protections !== 'No protections' && pick.protections !== ''
                  ? protectionEngine.getProtectionSummary(pick.protections)
                  : null;

                const protectionResolution = pick.protections && protectionSummary && pick.pickNumber
                  ? protectionEngine.evaluateProtection(pick.protections, pick.pickNumber, 2026)
                  : null;

                const isComplex = pick.protections ? protectionEngine.isComplexProtection(pick.protections) : false;

                return (
                  <div
                    key={uniquePickId}
                    className={`rounded-lg border ${
                      hasTradeHistory ? 'bg-blue-50/50 border-blue-300' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <button
                      onClick={() => hasTradeDetails && toggleTradeDetails(uniquePickId)}
                      className={`w-full p-3 text-left ${hasTradeDetails ? 'cursor-pointer hover:bg-blue-50 transition-colors' : ''}`}
                      disabled={!hasTradeDetails}
                    >
                      <div className="flex items-center gap-2 sm:gap-4">
                        <div
                          className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0"
                          style={{ backgroundColor: team.primaryColor }}
                        >
                          <span className="text-lg sm:text-2xl font-bold text-white">{pick.pickNumber}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-gray-900 text-sm sm:text-base">
                              Round {pick.round}, Pick {pick.pickNumber}
                            </p>
                            {protectionSummary && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium bg-amber-100 text-amber-800">
                                <Shield className="w-3 h-3" />
                                {protectionSummary}
                              </span>
                            )}
                            {isComplex && (
                              <div title="Complex protection">
                                <Info className="w-4 h-4 text-blue-500" />
                              </div>
                            )}
                          </div>
                          {hasTradeHistory && (
                            <p className="text-[9px] sm:text-[10px] text-blue-600 font-medium mt-0.5">
                              {pick.isSwapRights ? 'Swap Rights' : 'Traded'} - {pick.from}
                            </p>
                          )}
                          {protectionResolution && (
                            <p className={`text-[9px] sm:text-[10px] font-medium mt-0.5 ${
                              protectionResolution.willConvey ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {protectionResolution.willConvey ? '✓ Will convey' : '✗ Protected'}: {protectionResolution.explanation}
                            </p>
                          )}
                        </div>
                        {hasTradeDetails && (
                          <div className="flex-shrink-0">
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                            ) : (
                              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                            )}
                          </div>
                        )}
                      </div>
                    </button>

                    {/* Trade Details Expansion */}
                    {hasTradeDetails && isExpanded && (
                      <div className="px-3 pb-3 pt-0">
                        <div className="bg-white rounded-lg p-3 border border-blue-200">
                          <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2">
                            {pick.isSwapRights ? 'Swap Rights Details' : 'Trade Details'}
                          </h4>
                          <div className="text-xs sm:text-sm text-gray-700 space-y-2">
                            <p>
                              <span className="font-semibold">From:</span> {pick.from}
                            </p>
                            {pick.protections && (
                              <div>
                                <p className="font-semibold mb-1">Protections:</p>
                                <p className="ml-2 text-gray-600">{pick.protections}</p>
                                {protectionResolution && (
                                  <div className={`mt-2 p-2 rounded text-xs ${
                                    protectionResolution.willConvey
                                      ? 'bg-green-50 border border-green-200'
                                      : 'bg-red-50 border border-red-200'
                                  }`}>
                                    <p className={protectionResolution.willConvey ? 'text-green-800' : 'text-red-800'}>
                                      <strong>Outcome:</strong> {protectionResolution.explanation}
                                    </p>
                                    {protectionResolution.alternativeOutcome && (
                                      <p className="text-gray-700 mt-1">
                                        <strong>If protected:</strong> {protectionResolution.alternativeOutcome}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
