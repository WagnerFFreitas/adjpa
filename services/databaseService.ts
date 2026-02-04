
import { Member, Payroll, Transaction, FinancialAccount, Unit, Asset, EmployeeLeave } from '../types';
import { MOCK_UNITS, MOCK_MEMBERS, MOCK_TRANSACTIONS, MOCK_ACCOUNTS } from '../constants';

const apiUrl = process.env.API_URL;

export class DatabaseService {
  private isApiConfigured(): boolean {
    return !!apiUrl;
  }

  // Unidades
  async getUnits(): Promise<Unit[]> {
    if (!this.isApiConfigured()) {
      console.info("ADJPA ERP: Usando modo de demonstração (Unidades)");
      return MOCK_UNITS;
    }
    try {
      const res = await fetch(`${apiUrl}/units`);
      if (!res.ok) throw new Error('Falha ao carregar unidades');
      return await res.json();
    } catch {
      console.warn("API indisponível, usando dados de demonstração (Unidades)");
      return MOCK_UNITS;
    }
  }

  // Membros
  async getMembers(unitId?: string): Promise<Member[]> {
    if (!this.isApiConfigured()) {
      console.info("ADJPA ERP: Usando modo de demonstração (Membros)");
      return MOCK_MEMBERS.filter(m => !unitId || m.unitId === unitId);
    }
    try {
      const url = unitId ? `${apiUrl}/members?unitId=${encodeURIComponent(unitId)}` : `${apiUrl}/members`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Falha ao carregar membros');
      return await res.json();
    } catch {
      console.warn("API indisponível, usando dados de demonstração (Membros)");
      return MOCK_MEMBERS.filter(m => !unitId || m.unitId === unitId);
    }
  }

  async saveMember(member: Partial<Member>): Promise<void> {
    if (!this.isApiConfigured()) return;
    await fetch(`${apiUrl}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(member),
    });
  }

  // Financeiro
  async getTransactions(unitId?: string): Promise<Transaction[]> {
    if (!this.isApiConfigured()) {
      console.info("ADJPA ERP: Usando modo de demonstração (Financeiro)");
      return MOCK_TRANSACTIONS.filter(t => !unitId || t.unitId === unitId);
    }
    try {
      const url = unitId ? `${apiUrl}/transactions?unitId=${encodeURIComponent(unitId)}` : `${apiUrl}/transactions`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Falha ao carregar transações');
      return await res.json();
    } catch {
      console.warn("API indisponível, usando dados de demonstração (Financeiro)");
      return MOCK_TRANSACTIONS.filter(t => !unitId || t.unitId === unitId);
    }
  }

  async saveTransaction(transaction: Partial<Transaction>): Promise<void> {
    if (!this.isApiConfigured()) return;
    await fetch(`${apiUrl}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction),
    });
  }

  // Contas
  async getAccounts(unitId?: string): Promise<FinancialAccount[]> {
    if (!this.isApiConfigured()) {
      return MOCK_ACCOUNTS.filter(a => !unitId || a.unitId === unitId);
    }
    try {
      const url = unitId ? `${apiUrl}/accounts?unitId=${encodeURIComponent(unitId)}` : `${apiUrl}/accounts`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Falha ao carregar contas');
      return await res.json();
    } catch {
      console.warn("API indisponível, usando dados de demonstração (Contas)");
      return MOCK_ACCOUNTS.filter(a => !unitId || a.unitId === unitId);
    }
  }
}

export const dbService = new DatabaseService();
