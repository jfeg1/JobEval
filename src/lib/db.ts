import Dexie, { type Table } from 'dexie';

interface StoredWizardData {
  id: string; // sessionId
  companyProfile: any;
  positionBasicInfo: any;
  positionDetails: any;
  selectedOccupation: any;
  budget: any;
  result: any;
  wizardState: any;
  createdAt: string;
  updatedAt: string;
}

class JobEvalDatabase extends Dexie {
  wizardSessions!: Table<StoredWizardData>;

  constructor() {
    super('JobEvalDB');
    this.version(1).stores({
      wizardSessions: 'id, createdAt, updatedAt'
    });
  }
}

export const db = new JobEvalDatabase();
