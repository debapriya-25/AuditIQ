export const PRICING = {
  cursor: {
    hobby: { price: 0 },
    pro: { price: 20 },
    business: { price: 40 },
  },
  github_copilot: {
    individual: { price: 10 },
    business: { price: 19 },
    enterprise: { price: 39 },
  },
  claude: {
    free: { price: 0 },
    pro: { price: 20 },
    team: { price: 30 }, // min 5 seats
    enterprise: { price: null }, // custom pricing
  },
  chatgpt: {
    free: { price: 0 },
    plus: { price: 20 },
    team: { price: 30 }, // min 2 seats (yearly is $25/mo but monthly is $30/mo)
    enterprise: { price: null }, // custom pricing
  },
  gemini: {
    free: { price: 0 },
    advanced: { price: 20 },
  },
  windsurf: {
    free: { price: 0 },
    pro: { price: 20 }, // guess based on standard IDE pricing
  },
  v0: {
    free: { price: 0 },
    premium: { price: 20 },
  }
} as const;
