export interface IFaqItem {
  id: string;
  question: string;
  answer: string;
  theme: string;
}

export const LANDING_FAQ_IDS: string[] = [
  'what-is-zlend',
  'how-it-works',
  'supported-assets',
  'getting-started'
];

export const FAQ_ITEMS: IFaqItem[] = [
  {
    id: 'what-is-aleo',
    question: 'What is Aleo?',
    answer: 'Aleo is a blockchain that leverages zero-knowledge proofs (zk-SNARKs) to enable private, secure decentralized applications.',
    theme: 'General'
  },
  {
    id: 'what-is-zlend',
    question: 'What is zlend?',
    answer: 'zlend is the lending and borrowing application built on Aleo, allowing users to lend and borrow digital assets with privacy preserved through zk-SNARK technology.',
    theme: 'General'
  },
  {
    id: 'how-it-works',
    question: 'How does lending and borrowing work on zlend?',
    answer: 'Users can lend their assets to earn interest or borrow assets by providing collateral. All transactions and balances are confidential thanks to zk-SNARKs.',
    theme: 'Usage'
  },
  {
    id: 'supported-assets',
    question: 'What assets can I lend or borrow on zlend?',
    answer: 'Currently, zlend supports USDC, Aleo, and ETH. We plan to add more assets soon.',
    theme: 'Usage'
  },
  {
    id: 'collateral',
    question: 'How does collateral work?',
    answer: 'To borrow, you must lock collateral with a value greater than your loan to secure the transaction and protect lenders.',
    theme: 'Usage'
  },
  {
    id: 'interest-rates',
    question: 'What are the interest rates?',
    answer: 'Interest rates on zlend are dynamic and depend on supply and demand within the app.',
    theme: 'Usage'
  },
  {
    id: 'getting-started',
    question: 'How do I start lending or borrowing?',
    answer: 'Launch the app and connect your Aleo-compatible wallet, deposit assets, and follow the easy steps in our user interface.',
    theme: 'Usage'
  },
  {
    id: 'privacy',
    question: 'Is my data visible to others?',
    answer: 'No. zk-SNARKs ensure your transaction details and balances remain private and are never exposed publicly.',
    theme: 'Security & Privacy'
  },
  {
    id: 'risks',
    question: 'What risks should I be aware of?',
    answer: 'As with any financial application, risks include asset volatility, collateral liquidation, and technological risks. Please understand these risks before participating.',
    theme: 'Security & Privacy'
  },
  {
    id: 'tracking',
    question: 'How can I track my loans and borrows?',
    answer: 'Our secure dashboard allows you to monitor your active loans, borrowings, and accrued interest in real time.',
    theme: 'Additional Information'
  },
  {
    id: 'fees',
    question: 'Are there any fees?',
    answer: 'Yes, minimal fees apply to cover network costs on Aleo.',
    theme: 'Additional Information'
  },
  {
    id: 'support',
    question: 'How can I get support or report issues?',
    answer: `Reach out to us at <a href="mailto:contact@zlend.fi" style="color: #008f32;font-weight: 600;text-decoration: none;">contact@zlend.fi</a> or join our community on <a href="https://discord.gg/VJkXvVKWfp" target="_blank" rel="noopener noreferrer" style="color: #008f32;font-weight: 600;text-decoration: none;">Discord</a> for assistance.`,
    theme: 'Additional Information'
  }
];