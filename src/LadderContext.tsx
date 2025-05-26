import React, { createContext, useContext, useState } from 'react';

export type Offset = { x: number; y: number };

export interface LadderState {
  topLabels: string[];
  values: number[];
  levelLabels: string[][];
  // Offsets for top-level labels (one per axis)
  topLabelOffsets: Offset[];
  // Offsets for level labels: [axis][level] = Offset
  levelLabelOffsets: Offset[][];
  setTopLabels: (labels: string[]) => void;
  setValues: (values: number[]) => void;
  setLevelLabels: (labels: string[][]) => void;
  setTopLabelOffsets: (offsets: Offset[]) => void;
  setLevelLabelOffsets: (offsets: Offset[][]) => void;
}

const DEFAULT_TOP_LABELS = [
  "Technology",
  "System",
  "People",
  "Process",
  "Influence"
];
const DEFAULT_VALUES = [3, 4, 2, 5, 3];
const DEFAULT_LEVEL_LABELS = [
  ["Adopts", "Specializes", "Evangelizes", "Masters", "Creates"],
  ["Enhances", "Designs", "Owns", "Evolves", "Leads"],
  ["Learns", "Supports", "Mentors", "Coordinates", "Manages"],
  ["Follows", "Enforces", "Challenges", "Adjusts", "Defines"],
  ["Subsystem", "Team", "Multiple Teams", "Company", "Community"]
];
const DEFAULT_TOP_LABEL_OFFSETS = [
  { "x": -3, "y": -16 },
  { "x": 39.3971488713305, "y": 0.33126291998991064 },
  { "x": 3.145231559845172, "y": 15.66873708001009 },
  { "x": -3.145231559845172, "y": 13.66873708001009 },
  { "x": -41.3971488713305, "y": -0.6687370800101462 }
];
const DEFAULT_LEVEL_LABEL_OFFSETS = [
  [
    { "x": 28, "y": 13.199999999999989 },
    { "x": 32, "y": 11.199999999999989 },
    { "x": 36, "y": 7.199999999999989 },
    { "x": 23, "y": 3.200000000000017 },
    { "x": 22, "y": 1.200000000000017 }
  ],
  [
    { "x": 0.914358496049374, "y": 18.34953415699772 },
    { "x": 1.4805499746044575, "y": 16.238077976996067 },
    { "x": -1.953258546840459, "y": 15.126621796994357 },
    { "x": 1.6129329317146244, "y": 14.015165616992704 },
    { "x": 3.179124410269708, "y": 12.903709436990994 }
  ],
  [
    { "x": -21.392322899034866, "y": -4.949534156997743 },
    { "x": -29.201450972393957, "y": -0.8380779769960327 },
    { "x": -23.010579045753104, "y": 3.2733782030056773 },
    { "x": -29.819707119112252, "y": 3.3848343830072736 },
    { "x": -20.6288351924714, "y": 7.4962905630089836 }
  ],
  [
    { "x": -17.607677100965134, "y": -5.949534156997743 },
    { "x": -21.798549027606043, "y": -4.838077976996033 },
    { "x": -29.989420954246896, "y": -5.726621796994323 },
    { "x": -21.180292880887748, "y": -0.6151656169927264 },
    { "x": 17.6288351924714, "y": 14.496290563008984 }
  ],
  [
    { "x": 9.085641503950626, "y": -10.65046584300228 },
    { "x": -2.4805499746044575, "y": -7.76192202300399 },
    { "x": 17.95325854684046, "y": -10.873378203005643 },
    { "x": 15.387067068285404, "y": -14.984834383007353 },
    { "x": 10.82087558973032, "y": -15.096290563009006 }
  ]
];

const LadderContext = createContext<LadderState | undefined>(undefined);

export const LadderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [topLabels, setTopLabels] = useState(DEFAULT_TOP_LABELS);
  const [values, setValues] = useState(DEFAULT_VALUES);
  const [levelLabels, setLevelLabels] = useState(DEFAULT_LEVEL_LABELS);
  const [topLabelOffsets, setTopLabelOffsets] = useState(DEFAULT_TOP_LABEL_OFFSETS);
  const [levelLabelOffsets, setLevelLabelOffsets] = useState(DEFAULT_LEVEL_LABEL_OFFSETS);

  return (
    <LadderContext.Provider value={{
      topLabels, setTopLabels,
      values, setValues,
      levelLabels, setLevelLabels,
      topLabelOffsets, setTopLabelOffsets,
      levelLabelOffsets, setLevelLabelOffsets,
    }}>
      {children}
    </LadderContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export function useLadderContext() {
  const ctx = useContext(LadderContext);
  if (!ctx) throw new Error('useLadderContext must be used within a LadderProvider');
  return ctx;
} 