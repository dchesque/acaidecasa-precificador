import { CustoOperacional } from '@/types/financeiro';
import { mockCustosOperacionais } from '@/data/mockFinanceiroData';

export class CustosOperacionaisService {
  private static custos: CustoOperacional[] = [...mockCustosOperacionais];

  static async getAll(): Promise<CustoOperacional[]> {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.custos].sort((a, b) => {
      // Ordenar por ano e mês (mais recente primeiro)
      if (a.ano !== b.ano) return b.ano - a.ano;
      return b.mes - a.mes;
    });
  }

  static async getByPeriodo(ano?: number): Promise<CustoOperacional[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    let filteredCustos = [...this.custos];

    if (ano) {
      filteredCustos = filteredCustos.filter(custo => custo.ano === ano);
    }

    return filteredCustos.sort((a, b) => {
      if (a.ano !== b.ano) return b.ano - a.ano;
      return b.mes - a.mes;
    });
  }

  static async getByMesAno(mes: number, ano: number): Promise<CustoOperacional | null> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return this.custos.find(custo => custo.mes === mes && custo.ano === ano) || null;
  }

  static async create(data: Omit<CustoOperacional, 'id' | 'createdAt' | 'updatedAt'>): Promise<CustoOperacional> {
    await new Promise(resolve => setTimeout(resolve, 400));

    // Verificar se já existe custo para este mês/ano
    const existingCusto = this.custos.find(custo => custo.mes === data.mes && custo.ano === data.ano);
    if (existingCusto) {
      throw new Error(`Já existe um custo operacional cadastrado para ${data.mes}/${data.ano}`);
    }

    const newCusto: CustoOperacional = {
      ...data,
      id: `custo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.custos.push(newCusto);
    return newCusto;
  }

  static async update(id: string, data: Partial<Omit<CustoOperacional, 'id' | 'createdAt' | 'updatedAt'>>): Promise<CustoOperacional> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const index = this.custos.findIndex(custo => custo.id === id);
    if (index === -1) {
      throw new Error('Custo operacional não encontrado');
    }

    const existingCusto = this.custos[index];

    // Se estiver mudando mês/ano, verificar duplicação
    if (data.mes !== undefined || data.ano !== undefined) {
      const novoMes = data.mes ?? existingCusto.mes;
      const novoAno = data.ano ?? existingCusto.ano;

      const duplicateCusto = this.custos.find(custo =>
        custo.id !== id && custo.mes === novoMes && custo.ano === novoAno
      );

      if (duplicateCusto) {
        throw new Error(`Já existe um custo operacional cadastrado para ${novoMes}/${novoAno}`);
      }
    }

    const updatedCusto: CustoOperacional = {
      ...existingCusto,
      ...data,
      updatedAt: new Date()
    };

    this.custos[index] = updatedCusto;
    return updatedCusto;
  }

  static async delete(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));

    const index = this.custos.findIndex(custo => custo.id === id);
    if (index === -1) {
      throw new Error('Custo operacional não encontrado');
    }

    this.custos.splice(index, 1);
  }

  static async getMetricasResumo(): Promise<{
    custoMesAtual: number;
    mediaDozeMeses: number;
    variacaoMesAnterior: number;
    totalAnoAtual: number;
  }> {
    await new Promise(resolve => setTimeout(resolve, 200));

    const agora = new Date();
    const mesAtual = agora.getMonth() + 1;
    const anoAtual = agora.getFullYear();

    // Custo do mês atual
    const custoMesAtual = this.custos.find(custo =>
      custo.mes === mesAtual && custo.ano === anoAtual
    )?.valor || 0;

    // Últimos 12 meses para média
    const ultimosDozeMeses = this.custos
      .filter(custo => {
        const dataCusto = new Date(custo.ano, custo.mes - 1);
        const dozeMesesAtras = new Date(agora);
        dozeMesesAtras.setMonth(dozeMesesAtras.getMonth() - 12);
        return dataCusto >= dozeMesesAtras;
      })
      .slice(0, 12);

    const mediaDozeMeses = ultimosDozeMeses.length > 0
      ? ultimosDozeMeses.reduce((sum, custo) => sum + custo.valor, 0) / ultimosDozeMeses.length
      : 0;

    // Variação mês anterior
    const mesAnterior = mesAtual === 1 ? 12 : mesAtual - 1;
    const anoMesAnterior = mesAtual === 1 ? anoAtual - 1 : anoAtual;
    const custoMesAnterior = this.custos.find(custo =>
      custo.mes === mesAnterior && custo.ano === anoMesAnterior
    )?.valor || 0;

    const variacaoMesAnterior = custoMesAnterior > 0
      ? ((custoMesAtual - custoMesAnterior) / custoMesAnterior) * 100
      : 0;

    // Total do ano atual
    const totalAnoAtual = this.custos
      .filter(custo => custo.ano === anoAtual)
      .reduce((sum, custo) => sum + custo.valor, 0);

    return {
      custoMesAtual,
      mediaDozeMeses,
      variacaoMesAnterior,
      totalAnoAtual
    };
  }

  static async getEvolucaoUltimosMeses(quantidade: number = 12): Promise<Array<{
    mes: number;
    ano: number;
    valor: number;
    label: string;
  }>> {
    await new Promise(resolve => setTimeout(resolve, 200));

    const agora = new Date();
    const meses = [];

    for (let i = quantidade - 1; i >= 0; i--) {
      const data = new Date(agora);
      data.setMonth(data.getMonth() - i);

      const mes = data.getMonth() + 1;
      const ano = data.getFullYear();

      const custo = this.custos.find(c => c.mes === mes && c.ano === ano);

      meses.push({
        mes,
        ano,
        valor: custo?.valor || 0,
        label: `${mes.toString().padStart(2, '0')}/${ano}`
      });
    }

    return meses;
  }

  static async getAnosDisponiveis(): Promise<number[]> {
    await new Promise(resolve => setTimeout(resolve, 100));

    const anos = [...new Set(this.custos.map(custo => custo.ano))];
    return anos.sort((a, b) => b - a);
  }

  static validateCustoData(data: Partial<CustoOperacional>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (data.mes !== undefined) {
      if (data.mes < 1 || data.mes > 12) {
        errors.push('Mês deve estar entre 1 e 12');
      }
    }

    if (data.ano !== undefined) {
      const currentYear = new Date().getFullYear();
      if (data.ano < 2020 || data.ano > currentYear + 1) {
        errors.push(`Ano deve estar entre 2020 e ${currentYear + 1}`);
      }
    }

    if (data.valor !== undefined) {
      if (data.valor <= 0) {
        errors.push('Valor deve ser maior que zero');
      }
      if (data.valor > 1000000) {
        errors.push('Valor não pode exceder R$ 1.000.000');
      }
    }

    if (data.observacoes !== undefined && data.observacoes.length > 500) {
      errors.push('Observações não podem exceder 500 caracteres');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}