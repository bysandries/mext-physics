export interface TopicData {
  id: string;
  number: number;
  title: string;
  part: string;
  partNumber: number;
  anchor: string;
  theory: string;
  formulas: Formula[];
  framework: string[];
  problems: Problem[];
  tags: string[];
  theoryOnly: boolean;
}

export interface Formula {
  latex: string;
  description: string;
}

export interface Problem {
  examRef: string;
  year: number;
  parts: ProblemPart[];
}

export interface QuestionBank {
  topicId: string;
  questions: BankQuestion[];
}

export interface BankQuestion {
  id: string;
  source: string;
  question: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
}

export interface ProblemPart {
  partNum: number;
  parameters: string;
  formulas: string;
  calculations: string;
  answer: string;
  conclusion: string;
}
