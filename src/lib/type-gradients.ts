export interface TypeGradient {
  bg: string;
  shadow: string;
}

export const TYPE_GRADIENTS: Record<string, TypeGradient> = {
  fire:     { bg: "radial-gradient(circle at 50% 70%,#ff7a2a,#8a2010 80%)",  shadow: "0 24px 60px rgba(168,51,26,0.35)"   },
  ghost:    { bg: "radial-gradient(circle at 50% 70%,#8b6fd4,#4a3a8a 80%)",  shadow: "0 24px 60px rgba(74,58,138,0.35)"   },
  poison:   { bg: "radial-gradient(circle at 50% 70%,#8b6fd4,#4a3a8a 80%)",  shadow: "0 24px 60px rgba(74,58,138,0.35)"   },
  water:    { bg: "radial-gradient(circle at 50% 70%,#4aa3e0,#2a5a8a 80%)",  shadow: "0 24px 60px rgba(42,90,138,0.35)"   },
  electric: { bg: "radial-gradient(circle at 50% 70%,#e6c84a,#8a7020 80%)",  shadow: "0 24px 60px rgba(138,112,32,0.35)"  },
  psychic:  { bg: "radial-gradient(circle at 50% 70%,#e89ec8,#7a3a6a 80%)",  shadow: "0 24px 60px rgba(122,58,106,0.35)"  },
  fighting: { bg: "radial-gradient(circle at 50% 70%,#d04a4a,#7a2828 80%)",  shadow: "0 24px 60px rgba(122,40,40,0.35)"   },
  dragon:   { bg: "radial-gradient(circle at 50% 70%,#e6a84a,#8a5a20 80%)",  shadow: "0 24px 60px rgba(138,90,32,0.35)"   },
  normal:   { bg: "radial-gradient(circle at 50% 70%,#b8a878,#6a5838 80%)",  shadow: "0 24px 60px rgba(106,88,56,0.35)"   },
  grass:    { bg: "radial-gradient(circle at 50% 70%,#78c850,#3a6820 80%)",  shadow: "0 24px 60px rgba(58,104,32,0.35)"   },
  ice:      { bg: "radial-gradient(circle at 50% 70%,#98d8d8,#3a7880 80%)",  shadow: "0 24px 60px rgba(58,120,128,0.35)"  },
  rock:     { bg: "radial-gradient(circle at 50% 70%,#b8a038,#6a5818 80%)",  shadow: "0 24px 60px rgba(106,88,24,0.35)"   },
  ground:   { bg: "radial-gradient(circle at 50% 70%,#e0c068,#887030 80%)",  shadow: "0 24px 60px rgba(136,112,48,0.35)"  },
  bug:      { bg: "radial-gradient(circle at 50% 70%,#a8b820,#506010 80%)",  shadow: "0 24px 60px rgba(80,96,16,0.35)"    },
  dark:     { bg: "radial-gradient(circle at 50% 70%,#5a5878,#2a2838 80%)",  shadow: "0 24px 60px rgba(42,40,56,0.35)"    },
  steel:    { bg: "radial-gradient(circle at 50% 70%,#b8b8d0,#585878 80%)",  shadow: "0 24px 60px rgba(88,88,120,0.35)"   },
  fairy:    { bg: "radial-gradient(circle at 50% 70%,#ee99ac,#8a4060 80%)",  shadow: "0 24px 60px rgba(138,64,96,0.35)"   },
  flying:   { bg: "radial-gradient(circle at 50% 70%,#a890f0,#5a4098 80%)",  shadow: "0 24px 60px rgba(90,64,152,0.35)"   },
};

export const FALLBACK_GRADIENT: TypeGradient = {
  bg:     "radial-gradient(circle at 50% 70%,#3a3f4a,#1e2228 80%)",
  shadow: "0 24px 60px rgba(0,0,0,0.35)",
};
