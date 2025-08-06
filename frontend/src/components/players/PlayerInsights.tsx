import React from 'react';
import { Player } from '@/lib/hooks/usePlayers';
import { PlayerPrediction } from '@/lib/hooks/usePredictions';
import { Lightbulb, TrendingUp, AlertTriangle, Target, Calendar, Users } from 'lucide-react';

interface PlayerInsightsProps {
  player: Player;
  prediction?: PlayerPrediction | null;
}

export default function PlayerInsights({ player, prediction }: PlayerInsightsProps) {
  // Generate dynamic insights based on player data and predictions
  const generateInsights = () => {
    const insights = [];

    // Age-based insights
    if (player.age) {
      if (player.age <= 23) {
        insights.push({
          type: 'positive',
          icon: <TrendingUp className="h-4 w-4" />,
          title: 'Youth Advantage',
          description: `At ${player.age} years old, ${player.name} is entering his athletic prime with room for significant improvement.`
        });
      } else if (player.age >= 30) {
        insights.push({
          type: 'warning',
          icon: <AlertTriangle className="h-4 w-4" />,
          title: 'Age Considerations',
          description: `${player.name} is ${player.age} years old. Monitor for potential age-related decline, especially at ${player.position}.`
        });
      }
    }

    // Experience-based insights
    if (player.experience !== undefined) {
      if (player.experience <= 2 && player.position !== 'K') {
        insights.push({
          type: 'positive',
          icon: <Target className="h-4 w-4" />,
          title: 'Breakout Window',
          description: `Year ${player.experience + 1} is often when ${player.position}s make their biggest leap. High upside potential.`
        });
      } else if (player.experience >= 8) {
        insights.push({
          type: 'neutral',
          icon: <Users className="h-4 w-4" />,
          title: 'Veteran Presence',
          description: `${player.experience} years of experience brings consistency and leadership, but ceiling may be established.`
        });
      }
    }

    // Position-specific insights
    if (player.position === 'RB') {
      insights.push({
        type: 'warning',
        icon: <AlertTriangle className="h-4 w-4" />,
        title: 'Position Risk',
        description: 'RBs have the highest injury risk and shortest fantasy shelf life. Consider handcuff options.'
      });
    } else if (player.position === 'TE') {
      insights.push({
        type: 'neutral',
        icon: <Target className="h-4 w-4" />,
        title: 'Position Scarcity',
        description: 'Elite TEs are rare. If projected well, could provide significant positional advantage.'
      });
    } else if (player.position === 'QB') {
      insights.push({
        type: 'positive',
        icon: <TrendingUp className="h-4 w-4" />,
        title: 'Position Longevity',
        description: 'QBs typically have longer careers and more consistent fantasy production than skill positions.'
      });
    }

    // Team-based insights
    const strongOffenses = ['BUF', 'KC', 'SF', 'MIA', 'CIN', 'DAL', 'PHI'];
    const weakOffenses = ['NYJ', 'NE', 'WAS', 'CAR', 'CHI'];

    if (strongOffenses.includes(player.team)) {
      insights.push({
        type: 'positive',
        icon: <TrendingUp className="h-4 w-4" />,
        title: 'Elite Offensive System',
        description: `${player.team} has one of the league's top offenses, creating more scoring opportunities.`
      });
    } else if (weakOffenses.includes(player.team)) {
      insights.push({
        type: 'warning',
        icon: <AlertTriangle className="h-4 w-4" />,
        title: 'Offensive Concerns',
        description: `${player.team}'s offensive struggles could limit ${player.name}'s fantasy ceiling.`
      });
    }

    // Prediction-based insights
    if (prediction) {
      if (prediction.breakout_score >= 0.7) {
        insights.push({
          type: 'positive',
          icon: <TrendingUp className="h-4 w-4" />,
          title: 'High Breakout Potential',
          description: `${Math.round(prediction.breakout_score * 100)}% breakout probability. Could significantly outperform ADP.`
        });
      }

      if (prediction.bust_risk >= 0.6) {
        insights.push({
          type: 'warning',
          icon: <AlertTriangle className="h-4 w-4" />,
          title: 'Bust Risk Alert',
          description: `${Math.round(prediction.bust_risk * 100)}% bust risk. Consider safer alternatives or handcuffs.`
        });
      }

      if (prediction.confidence >= 0.8) {
        insights.push({
          type: 'positive',
          icon: <Target className="h-4 w-4" />,
          title: 'High Confidence Projection',
          description: `${Math.round(prediction.confidence * 100)}% confidence in projection. Reliable floor expected.`
        });
      }
    }

    return insights.slice(0, 4); // Show up to 4 insights
  };

  const insights = generateInsights();

  // Generate draft strategy tips
  const generateDraftTips = () => {
    const tips = [];

    if (prediction) {
      // Value-based tip
      if (prediction.breakout_score >= 0.6) {
        tips.push(`Target in mid-to-late rounds for potential league-winning value.`);
      }

      // Risk management
      if (prediction.bust_risk >= 0.5) {
        tips.push(`Have backup plan ready - consider drafting handcuff or alternative.`);
      }

      // Confidence-based strategy
      if (prediction.confidence >= 0.8) {
        tips.push(`Safe floor play - good for anchor position in your lineup.`);
      } else if (prediction.confidence <= 0.6) {
        tips.push(`Higher variance player - better suited for flex or bench role.`);
      }
    }

    // Position-specific tips
    if (player.position === 'QB' && prediction?.predicted_points && prediction.predicted_points >= 20) {
      tips.push(`Elite QB1 upside - consider reaching a round early in superflex leagues.`);
    } else if (player.position === 'RB') {
      tips.push(`Monitor training camp reports for workload clarity and injury updates.`);
    } else if (player.position === 'WR' && player.experience && player.experience <= 2) {
      tips.push(`Young WRs often break out in Year 2-3. Monitor target share closely.`);
    } else if (player.position === 'TE') {
      tips.push(`TE is boom-bust position. Prioritize target share and red zone looks.`);
    }

    return tips.slice(0, 3);
  };

  const draftTips = generateDraftTips();

  return (
    <div className="space-y-6">
      {/* Key Insights */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="h-5 w-5 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-900">Key Insights</h3>
        </div>

        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-l-4 ${
                insight.type === 'positive'
                  ? 'bg-green-50 border-green-400'
                  : insight.type === 'warning'
                  ? 'bg-yellow-50 border-yellow-400'
                  : 'bg-blue-50 border-blue-400'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-1 rounded ${
                    insight.type === 'positive'
                      ? 'text-green-600'
                      : insight.type === 'warning'
                      ? 'text-yellow-600'
                      : 'text-blue-600'
                  }`}
                >
                  {insight.icon}
                </div>
                <div>
                  <h4
                    className={`font-medium text-sm ${
                      insight.type === 'positive'
                        ? 'text-green-900'
                        : insight.type === 'warning'
                        ? 'text-yellow-900'
                        : 'text-blue-900'
                    }`}
                  >
                    {insight.title}
                  </h4>
                  <p
                    className={`text-sm mt-1 ${
                      insight.type === 'positive'
                        ? 'text-green-800'
                        : insight.type === 'warning'
                        ? 'text-yellow-800'
                        : 'text-blue-800'
                    }`}
                  >
                    {insight.description}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {insights.length === 0 && (
            <div className="text-center py-6">
              <Lightbulb className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No specific insights available for this player.</p>
            </div>
          )}
        </div>
      </div>

      {/* Draft Strategy */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-blue-900">Draft Strategy</h3>
        </div>

        <div className="space-y-3">
          {draftTips.map((tip, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
              <p className="text-blue-800 text-sm">{tip}</p>
            </div>
          ))}
        </div>

        {prediction && (
          <div className="mt-4 pt-4 border-t border-blue-200">
            <div className="text-sm text-blue-700">
              <strong>Bottom Line:</strong> {
                prediction.breakout_score >= 0.7
                  ? `High upside target with league-winning potential.`
                  : prediction.confidence >= 0.8
                  ? `Reliable contributor with solid floor.`
                  : prediction.bust_risk >= 0.5
                  ? `Proceed with caution - have backup plan ready.`
                  : `Balanced risk-reward profile for your roster.`
              }
            </div>
          </div>
        )}
      </div>

      {/* Player Timeline */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Season Outlook</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-semibold">Q1</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Early Season (Weeks 1-4)</h4>
              <p className="text-sm text-gray-600">
                {player.experience && player.experience <= 2
                  ? 'Monitor target share and role development'
                  : 'Should establish baseline performance level'
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold">Q2</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Mid Season (Weeks 5-10)</h4>
              <p className="text-sm text-gray-600">
                {prediction && prediction.breakout_score >= 0.6
                  ? 'Prime breakout window - expect uptick in production'
                  : 'Peak performance window with established role'
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-orange-600 font-semibold">Q3</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Late Season (Weeks 11-17)</h4>
              <p className="text-sm text-gray-600">
                {player.position === 'RB'
                  ? 'Higher injury risk - monitor workload management'
                  : player.age && player.age >= 30
                  ? 'Watch for fatigue in veteran players'
                  : 'Playoff push - maintain consistent production'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}