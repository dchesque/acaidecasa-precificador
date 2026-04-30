"use client";

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import {
  Configuracao,
  Categoria,
  UnidadeMedida,
  Fornecedor,
  Insumo,
  InsumoFornecedor,
  Receita,
  CopoBase,
  Combinado,
  ItemCardapio,
  Alerta
} from '@/types/database';
import { UserProfile } from '@/types/user';
import {
  ImportacaoVendas,
  VendaRegistrada,
  VendasSystemInfo,
  FiltrosVendas,
  DashboardVendas
} from '@/types/analise-vendas';
import {
  DashboardGestaoEstado,
  DashboardGestaoMetricas,
  PeriodoDashboard
} from '@/types/financeiro';
import {
  CustoOperacional
} from '@/types/custos-operacionais';
import {
  PeriodoImportacao,
  StatusPeriodo
} from '@/types/periodo';
import {
  mockCategorias,
  mockUnidadesMedida,
  mockFornecedores,
  mockInsumoFornecedores,
  mockInsumos,
  mockReceitas,
  mockCoposBase,
  mockCombinados,
  mockCardapio,
  mockUserProfile
} from '@/data/mockData';
import {
  mockImportacoes,
  mockVendasRegistradas,
  mockVendasSystemInfo,
  mockDashboardVendas
} from '@/data/mockVendasData';
import {
  mockCustosOperacionaisDual
} from '@/data/mockCustosOperacionaisDual';

// App State Interface
interface AppState {
  // Auth state
  user: User | null;
  session: Session | null;
  authLoading: boolean;
  // User profile
  userProfile: UserProfile | null;
  // App data
  configuracao: Configuracao | null;
  categorias: Categoria[];
  unidadesMedida: UnidadeMedida[];
  fornecedores: Fornecedor[];
  insumoFornecedores: InsumoFornecedor[];
  insumos: Insumo[];
  receitas: Receita[];
  coposBase: CopoBase[];
  combinados: Combinado[];
  cardapio: ItemCardapio[];
  alertas: Alerta[];
  // Vendas state
  vendasAnalise: {
    importacoes: ImportacaoVendas[];
    vendasRegistradas: VendaRegistrada[];
    systemInfo: VendasSystemInfo;
    filtros: FiltrosVendas;
    dashboardData?: DashboardVendas;
  };
  // Financial state
  custosOperacionais: CustoOperacional[];
  dashboardGestao: DashboardGestaoEstado;
  // Period management
  periodoAtualGestao: PeriodoImportacao | null;
  custosOperacionaisPorPeriodo: Map<string, CustoOperacional[]>;
  statusPeriodos: Map<string, StatusPeriodo>;
  loading: boolean;
  error: string | null;
}

// Action Types
type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_AUTH_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_SESSION'; payload: Session | null }
  | { type: 'SET_USER_PROFILE'; payload: UserProfile | null }
  | { type: 'UPDATE_USER_PROFILE'; payload: Partial<UserProfile> }
  | { type: 'UPDATE_USER_AVATAR'; payload: string }
  | { type: 'SET_CONFIGURACAO'; payload: Configuracao }
  | { type: 'SET_CATEGORIAS'; payload: Categoria[] }
  | { type: 'ADD_CATEGORIA'; payload: Categoria }
  | { type: 'UPDATE_CATEGORIA'; payload: Categoria }
  | { type: 'DELETE_CATEGORIA'; payload: string }
  | { type: 'SET_UNIDADES_MEDIDA'; payload: UnidadeMedida[] }
  | { type: 'ADD_UNIDADE_MEDIDA'; payload: UnidadeMedida }
  | { type: 'UPDATE_UNIDADE_MEDIDA'; payload: UnidadeMedida }
  | { type: 'DELETE_UNIDADE_MEDIDA'; payload: string }
  | { type: 'SET_FORNECEDORES'; payload: Fornecedor[] }
  | { type: 'ADD_FORNECEDOR'; payload: Fornecedor }
  | { type: 'UPDATE_FORNECEDOR'; payload: Fornecedor }
  | { type: 'DELETE_FORNECEDOR'; payload: string }
  | { type: 'SET_INSUMO_FORNECEDORES'; payload: InsumoFornecedor[] }
  | { type: 'ADD_INSUMO_FORNECEDOR'; payload: InsumoFornecedor }
  | { type: 'UPDATE_INSUMO_FORNECEDOR'; payload: InsumoFornecedor }
  | { type: 'DELETE_INSUMO_FORNECEDOR'; payload: string }
  | { type: 'SET_INSUMOS'; payload: Insumo[] }
  | { type: 'ADD_INSUMO'; payload: Insumo }
  | { type: 'UPDATE_INSUMO'; payload: Insumo }
  | { type: 'DELETE_INSUMO'; payload: string }
  | { type: 'SET_RECEITAS'; payload: Receita[] }
  | { type: 'ADD_RECEITA'; payload: Receita }
  | { type: 'UPDATE_RECEITA'; payload: Receita }
  | { type: 'DELETE_RECEITA'; payload: string }
  | { type: 'SET_COPOS_BASE'; payload: CopoBase[] }
  | { type: 'ADD_COPO_BASE'; payload: CopoBase }
  | { type: 'UPDATE_COPO_BASE'; payload: CopoBase }
  | { type: 'DELETE_COPO_BASE'; payload: string }
  | { type: 'SET_COMBINADOS'; payload: Combinado[] }
  | { type: 'ADD_COMBINADO'; payload: Combinado }
  | { type: 'UPDATE_COMBINADO'; payload: Combinado }
  | { type: 'DELETE_COMBINADO'; payload: string }
  | { type: 'SET_CARDAPIO'; payload: ItemCardapio[] }
  | { type: 'ADD_ITEM_CARDAPIO'; payload: ItemCardapio }
  | { type: 'UPDATE_ITEM_CARDAPIO'; payload: ItemCardapio }
  | { type: 'DELETE_ITEM_CARDAPIO'; payload: string }
  | { type: 'SET_ALERTAS'; payload: Alerta[] }
  | { type: 'ADD_ALERTA'; payload: Alerta }
  | { type: 'MARK_ALERTA_READ'; payload: string }
  // Vendas actions
  | { type: 'INIT_IMPORTACAO'; payload: ImportacaoVendas }
  | { type: 'ADD_VENDAS_REGISTRADAS'; payload: VendaRegistrada[] }
  | { type: 'UPDATE_SYSTEM_INFO'; payload: VendasSystemInfo }
  | { type: 'SET_VENDAS_FILTROS'; payload: FiltrosVendas }
  | { type: 'RESOLVE_PRODUTO_MATCH'; payload: { vendaId: string; itemCardapioId: string } }
  | { type: 'UPDATE_DASHBOARD_VENDAS'; payload: DashboardVendas }
  // Financial actions
  | { type: 'SET_CUSTOS_OPERACIONAIS'; payload: CustoOperacional[] }
  | { type: 'ADD_CUSTO_OPERACIONAL'; payload: CustoOperacional }
  | { type: 'UPDATE_CUSTO_OPERACIONAL'; payload: CustoOperacional }
  | { type: 'DELETE_CUSTO_OPERACIONAL'; payload: string }
  | { type: 'SET_DASHBOARD_GESTAO_PERIODO'; payload: PeriodoDashboard }
  | { type: 'UPDATE_DASHBOARD_GESTAO_METRICAS'; payload: DashboardGestaoMetricas }
  | { type: 'SET_DASHBOARD_GESTAO_LOADING'; payload: boolean }
  // Period management actions
  | { type: 'SET_PERIODO_GESTAO'; payload: PeriodoImportacao | null }
  | { type: 'ADD_CUSTOS_POR_PERIODO'; payload: { periodo: string; custos: CustoOperacional[] } }
  | { type: 'UPDATE_STATUS_PERIODO'; payload: { periodo: string; status: StatusPeriodo } }
  | { type: 'VALIDATE_PERIODO_CONSISTENCY'; payload: void };

// Initial State
const initialState: AppState = {
  // Auth state
  user: null,
  session: null,
  authLoading: true,
  // User profile
  userProfile: null,
  // App data
  configuracao: null,
  categorias: mockCategorias,
  unidadesMedida: mockUnidadesMedida,
  fornecedores: mockFornecedores,
  insumoFornecedores: mockInsumoFornecedores,
  insumos: mockInsumos,
  receitas: mockReceitas,
  coposBase: mockCoposBase,
  combinados: mockCombinados,
  cardapio: mockCardapio,
  alertas: [],
  // Vendas initial state
  vendasAnalise: {
    importacoes: mockImportacoes,
    vendasRegistradas: mockVendasRegistradas,
    systemInfo: mockVendasSystemInfo,
    filtros: {
      periodo: {
        inicio: new Date('2024-01-01'),
        fim: new Date('2024-03-31')
      },
      produto: '',
      statusAnalise: 'todos',
      statusMatch: 'todos',
      vendedor: '',
      orderBy: 'data',
      orderDirection: 'desc'
    },
    dashboardData: mockDashboardVendas
  },
  // Financial initial state
  custosOperacionais: mockCustosOperacionaisDual,
  dashboardGestao: {
    periodo: {
      inicio: new Date(new Date().getFullYear(), 0, 1), // Janeiro do ano atual
      fim: new Date()
    },
    loading: false,
    alertas: []
  },
  // Period management initial state
  periodoAtualGestao: null,
  custosOperacionaisPorPeriodo: new Map(),
  statusPeriodos: new Map(),
  loading: false,
  error: null,
};

// Reducer
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'SET_AUTH_LOADING':
      return { ...state, authLoading: action.payload };

    case 'SET_USER':
      return { ...state, user: action.payload };

    case 'SET_SESSION':
      return { ...state, session: action.payload };

    case 'SET_USER_PROFILE':
      return { ...state, userProfile: action.payload };

    case 'UPDATE_USER_PROFILE':
      return {
        ...state,
        userProfile: state.userProfile ? {
          ...state.userProfile,
          ...action.payload,
          updatedAt: new Date()
        } : null
      };

    case 'UPDATE_USER_AVATAR':
      return {
        ...state,
        userProfile: state.userProfile ? {
          ...state.userProfile,
          avatar: action.payload,
          updatedAt: new Date()
        } : null
      };

    case 'SET_CONFIGURACAO':
      return { ...state, configuracao: action.payload };
    
    case 'SET_CATEGORIAS':
      return { ...state, categorias: action.payload };
    
    case 'ADD_CATEGORIA':
      return { ...state, categorias: [...state.categorias, action.payload] };
    
    case 'UPDATE_CATEGORIA':
      return {
        ...state,
        categorias: state.categorias.map(item =>
          item.id === action.payload.id ? action.payload : item
        ),
      };
    
    case 'DELETE_CATEGORIA':
      return {
        ...state,
        categorias: state.categorias.filter(item => item.id !== action.payload),
      };
    
    case 'SET_UNIDADES_MEDIDA':
      return { ...state, unidadesMedida: action.payload };
    
    case 'ADD_UNIDADE_MEDIDA':
      return { ...state, unidadesMedida: [...state.unidadesMedida, action.payload] };
    
    case 'UPDATE_UNIDADE_MEDIDA':
      return {
        ...state,
        unidadesMedida: state.unidadesMedida.map(item =>
          item.id === action.payload.id ? action.payload : item
        ),
      };
    
    case 'DELETE_UNIDADE_MEDIDA':
      return {
        ...state,
        unidadesMedida: state.unidadesMedida.filter(item => item.id !== action.payload),
      };
    
    case 'SET_FORNECEDORES':
      return { ...state, fornecedores: action.payload };
    
    case 'ADD_FORNECEDOR':
      return { ...state, fornecedores: [...state.fornecedores, action.payload] };
    
    case 'UPDATE_FORNECEDOR':
      return {
        ...state,
        fornecedores: state.fornecedores.map(item =>
          item.id === action.payload.id ? action.payload : item
        ),
      };
    
    case 'DELETE_FORNECEDOR':
      return {
        ...state,
        fornecedores: state.fornecedores.filter(item => item.id !== action.payload),
      };
    
    case 'SET_INSUMO_FORNECEDORES':
      return { ...state, insumoFornecedores: action.payload };
    
    case 'ADD_INSUMO_FORNECEDOR':
      return { ...state, insumoFornecedores: [...state.insumoFornecedores, action.payload] };
    
    case 'UPDATE_INSUMO_FORNECEDOR':
      return {
        ...state,
        insumoFornecedores: state.insumoFornecedores.map(item =>
          item.id === action.payload.id ? action.payload : item
        ),
      };
    
    case 'DELETE_INSUMO_FORNECEDOR':
      return {
        ...state,
        insumoFornecedores: state.insumoFornecedores.filter(item => item.id !== action.payload),
      };
    
    case 'SET_INSUMOS':
      return { ...state, insumos: action.payload };
    
    case 'ADD_INSUMO':
      return { ...state, insumos: [...state.insumos, action.payload] };
    
    case 'UPDATE_INSUMO':
      return {
        ...state,
        insumos: state.insumos.map(item =>
          item.id === action.payload.id ? action.payload : item
        ),
      };
    
    case 'DELETE_INSUMO':
      return {
        ...state,
        insumos: state.insumos.filter(item => item.id !== action.payload),
      };
    
    case 'SET_RECEITAS':
      return { ...state, receitas: action.payload };
    
    case 'ADD_RECEITA':
      return { ...state, receitas: [...state.receitas, action.payload] };
    
    case 'UPDATE_RECEITA':
      return {
        ...state,
        receitas: state.receitas.map(item =>
          item.id === action.payload.id ? action.payload : item
        ),
      };
    
    case 'DELETE_RECEITA':
      return {
        ...state,
        receitas: state.receitas.filter(item => item.id !== action.payload),
      };
    
    case 'SET_COPOS_BASE':
      return { ...state, coposBase: action.payload };
    
    case 'ADD_COPO_BASE':
      return { ...state, coposBase: [...state.coposBase, action.payload] };
    
    case 'UPDATE_COPO_BASE':
      return {
        ...state,
        coposBase: state.coposBase.map(item =>
          item.id === action.payload.id ? action.payload : item
        ),
      };
    
    case 'DELETE_COPO_BASE':
      return {
        ...state,
        coposBase: state.coposBase.filter(item => item.id !== action.payload),
      };
    
    case 'SET_COMBINADOS':
      return { ...state, combinados: action.payload };
    
    case 'ADD_COMBINADO':
      return { ...state, combinados: [...state.combinados, action.payload] };
    
    case 'UPDATE_COMBINADO':
      return {
        ...state,
        combinados: state.combinados.map(item =>
          item.id === action.payload.id ? action.payload : item
        ),
      };
    
    case 'DELETE_COMBINADO':
      return {
        ...state,
        combinados: state.combinados.filter(item => item.id !== action.payload),
      };
    
    case 'SET_CARDAPIO':
      return { ...state, cardapio: action.payload };
    
    case 'ADD_ITEM_CARDAPIO':
      return { ...state, cardapio: [...state.cardapio, action.payload] };
    
    case 'UPDATE_ITEM_CARDAPIO':
      return {
        ...state,
        cardapio: state.cardapio.map(item =>
          item.id === action.payload.id ? action.payload : item
        ),
      };
    
    case 'DELETE_ITEM_CARDAPIO':
      return {
        ...state,
        cardapio: state.cardapio.filter(item => item.id !== action.payload),
      };
    
    case 'SET_ALERTAS':
      return { ...state, alertas: action.payload };
    
    case 'ADD_ALERTA':
      return { ...state, alertas: [action.payload, ...state.alertas] };
    
    case 'MARK_ALERTA_READ':
      return {
        ...state,
        alertas: state.alertas.map(alerta =>
          alerta.id === action.payload ? { ...alerta, lido: true } : alerta
        ),
      };

    // Vendas cases
    case 'INIT_IMPORTACAO':
      return {
        ...state,
        vendasAnalise: {
          ...state.vendasAnalise,
          importacoes: [...state.vendasAnalise.importacoes, action.payload]
        }
      };

    case 'ADD_VENDAS_REGISTRADAS':
      return {
        ...state,
        vendasAnalise: {
          ...state.vendasAnalise,
          vendasRegistradas: [...state.vendasAnalise.vendasRegistradas, ...action.payload]
        }
      };

    case 'UPDATE_SYSTEM_INFO':
      return {
        ...state,
        vendasAnalise: {
          ...state.vendasAnalise,
          systemInfo: action.payload
        }
      };

    case 'SET_VENDAS_FILTROS':
      return {
        ...state,
        vendasAnalise: {
          ...state.vendasAnalise,
          filtros: action.payload
        }
      };

    case 'RESOLVE_PRODUTO_MATCH':
      return {
        ...state,
        vendasAnalise: {
          ...state.vendasAnalise,
          vendasRegistradas: state.vendasAnalise.vendasRegistradas.map(venda =>
            venda.id === action.payload.vendaId
              ? {
                  ...venda,
                  itemCardapioId: action.payload.itemCardapioId,
                  statusMatch: 'manual' as const
                }
              : venda
          )
        }
      };

    case 'UPDATE_DASHBOARD_VENDAS':
      return {
        ...state,
        vendasAnalise: {
          ...state.vendasAnalise,
          dashboardData: action.payload
        }
      };

    // Financial cases
    case 'SET_CUSTOS_OPERACIONAIS':
      return {
        ...state,
        custosOperacionais: action.payload
      };

    case 'ADD_CUSTO_OPERACIONAL':
      return {
        ...state,
        custosOperacionais: [...state.custosOperacionais, action.payload]
      };

    case 'UPDATE_CUSTO_OPERACIONAL':
      return {
        ...state,
        custosOperacionais: state.custosOperacionais.map(custo =>
          custo.id === action.payload.id ? action.payload : custo
        )
      };

    case 'DELETE_CUSTO_OPERACIONAL':
      return {
        ...state,
        custosOperacionais: state.custosOperacionais.filter(custo => custo.id !== action.payload)
      };

    case 'SET_DASHBOARD_GESTAO_PERIODO':
      return {
        ...state,
        dashboardGestao: {
          ...state.dashboardGestao,
          periodo: action.payload
        }
      };

    case 'UPDATE_DASHBOARD_GESTAO_METRICAS':
      return {
        ...state,
        dashboardGestao: {
          ...state.dashboardGestao,
          metricas: action.payload
        }
      };

    case 'SET_DASHBOARD_GESTAO_LOADING':
      return {
        ...state,
        dashboardGestao: {
          ...state.dashboardGestao,
          loading: action.payload
        }
      };

    // Period management cases
    case 'SET_PERIODO_GESTAO':
      return {
        ...state,
        periodoAtualGestao: action.payload
      };

    case 'ADD_CUSTOS_POR_PERIODO': {
      const newMap = new Map(state.custosOperacionaisPorPeriodo);
      newMap.set(action.payload.periodo, action.payload.custos);
      return {
        ...state,
        custosOperacionaisPorPeriodo: newMap
      };
    }

    case 'UPDATE_STATUS_PERIODO': {
      const newStatusMap = new Map(state.statusPeriodos);
      newStatusMap.set(action.payload.periodo, action.payload.status);
      return {
        ...state,
        statusPeriodos: newStatusMap
      };
    }

    case 'VALIDATE_PERIODO_CONSISTENCY':
      // Esta action pode ser usada para disparar validações
      // Por ora, apenas retorna o estado atual
      return state;

    default:
      return state;
  }
};

// Enhanced Context with helper functions
interface AppContextValue {
  // State
  state: AppState;
  dispatch: React.Dispatch<AppAction>;

  // Auth getters
  user: User | null;
  session: Session | null;
  authLoading: boolean;
  isAuthenticated: boolean;

  // User profile getters
  userProfile: UserProfile | null;

  // Data getters
  configuracao: Configuracao | null;
  categorias: Categoria[];
  unidadesMedida: UnidadeMedida[];
  fornecedores: Fornecedor[];
  insumoFornecedores: InsumoFornecedor[];
  insumos: Insumo[];
  receitas: Receita[];
  coposBase: CopoBase[];
  combinados: Combinado[];
  cardapio: ItemCardapio[];
  alertas: Alerta[];

  // Vendas getters
  vendasAnalise: {
    importacoes: ImportacaoVendas[];
    vendasRegistradas: VendaRegistrada[];
    systemInfo: VendasSystemInfo;
    filtros: FiltrosVendas;
    dashboardData?: DashboardVendas;
  };

  // Financial getters
  custosOperacionais: CustoOperacional[];
  dashboardGestao: DashboardGestaoEstado;

  // Period management getters
  periodoAtualGestao: PeriodoImportacao | null;
  custosOperacionaisPorPeriodo: Map<string, CustoOperacional[]>;
  statusPeriodos: Map<string, StatusPeriodo>;

  // Auth actions
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setAuthLoading: (loading: boolean) => void;

  // User profile actions
  setUserProfile: (profile: UserProfile | null) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  updateUserAvatar: (avatar: string) => void;
  getUserProfile: () => UserProfile | null;
  saveUserProfileToStorage: (profile: UserProfile) => void;

  // Action functions
  addCategoria: (categoria: Categoria) => void;
  updateCategoria: (categoria: Categoria) => void;
  deleteCategoria: (id: string) => void;
  addFornecedor: (fornecedor: Fornecedor) => void;
  updateFornecedor: (fornecedor: Fornecedor) => void;
  deleteFornecedor: (id: string) => void;
  addInsumo: (insumo: Insumo) => void;
  updateInsumo: (insumo: Insumo) => void;
  deleteInsumo: (id: string) => void;
  addReceita: (receita: Receita) => void;
  updateReceita: (receita: Receita) => void;
  deleteReceita: (id: string) => void;
  addCopoBase: (copoBase: CopoBase) => void;
  updateCopoBase: (copoBase: CopoBase) => void;
  deleteCopoBase: (id: string) => void;
  addCombinado: (combinado: Combinado) => void;
  updateCombinado: (combinado: Combinado) => void;
  deleteCombinado: (id: string) => void;
  addItemCardapio: (item: ItemCardapio) => void;
  updateItemCardapio: (item: ItemCardapio) => void;
  deleteItemCardapio: (id: string) => void;

  // Vendas actions
  initImportacao: (importacao: ImportacaoVendas) => void;
  addVendasRegistradas: (vendas: VendaRegistrada[]) => void;
  updateSystemInfo: (info: VendasSystemInfo) => void;
  setVendasFiltros: (filtros: FiltrosVendas) => void;
  resolveProdutoMatch: (vendaId: string, itemCardapioId: string) => void;
  updateDashboardVendas: (data: DashboardVendas) => void;

  // Financial actions
  setCustosOperacionais: (custos: CustoOperacional[]) => void;
  addCustoOperacional: (custo: CustoOperacional) => void;
  updateCustoOperacional: (custo: CustoOperacional) => void;
  deleteCustoOperacional: (id: string) => void;
  setDashboardGestaoPeriodo: (periodo: PeriodoDashboard) => void;
  updateDashboardGestaoMetricas: (metricas: DashboardGestaoMetricas) => void;
  setDashboardGestaoLoading: (loading: boolean) => void;

  // Period management actions
  setPeriodoGestao: (periodo: PeriodoImportacao | null) => void;
  addCustosPorPeriodo: (periodo: string, custos: CustoOperacional[]) => void;
  updateStatusPeriodo: (periodo: string, status: StatusPeriodo) => void;
  validatePeriodoConsistency: () => void;

  // Price helper functions
  getPrecoVendaItem: (tipo: 'INSUMO' | 'RECEITA' | 'COPO_BASE', itemId: string) => number | null;
}

const AppContext = createContext<AppContextValue | null>(null);

// Provider
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load user profile from localStorage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        dispatch({ type: 'SET_USER_PROFILE', payload: { ...profile, updatedAt: new Date(profile.updatedAt) } });
      } catch (error) {
        console.error('Error loading user profile from localStorage:', error);
      }
    } else {
      // Load mock data if no profile exists
      dispatch({ type: 'SET_USER_PROFILE', payload: mockUserProfile });
    }
  }, []);

  // Auth action functions
  const setUser = (user: User | null) => dispatch({ type: 'SET_USER', payload: user });
  const setSession = (session: Session | null) => dispatch({ type: 'SET_SESSION', payload: session });
  const setAuthLoading = (loading: boolean) => dispatch({ type: 'SET_AUTH_LOADING', payload: loading });

  // User profile action functions
  const setUserProfile = (profile: UserProfile | null) => {
    dispatch({ type: 'SET_USER_PROFILE', payload: profile });
    if (profile) {
      saveUserProfileToStorage(profile);
    }
  };

  // Build the new profile locally so we can persist the exact same shape that
  // the reducer will produce — avoids reading stale closure state.
  const updateUserProfile = (updates: Partial<UserProfile>) => {
    const current = state.userProfile;
    if (!current) return;
    const nextProfile: UserProfile = { ...current, ...updates, updatedAt: new Date() };
    dispatch({ type: 'UPDATE_USER_PROFILE', payload: updates });
    saveUserProfileToStorage(nextProfile);
  };

  const updateUserAvatar = (avatar: string) => {
    const current = state.userProfile;
    if (!current) return;
    const nextProfile: UserProfile = { ...current, avatar, updatedAt: new Date() };
    dispatch({ type: 'UPDATE_USER_AVATAR', payload: avatar });
    saveUserProfileToStorage(nextProfile);
  };

  const getUserProfile = (): UserProfile | null => {
    return state.userProfile;
  };

  const saveUserProfileToStorage = (profile: UserProfile) => {
    try {
      localStorage.setItem('userProfile', JSON.stringify(profile));
    } catch (error) {
      console.error('Error saving user profile to localStorage:', error);
    }
  };

  // Action functions
  const addCategoria = (categoria: Categoria) => dispatch({ type: 'ADD_CATEGORIA', payload: categoria });
  const updateCategoria = (categoria: Categoria) => dispatch({ type: 'UPDATE_CATEGORIA', payload: categoria });
  const deleteCategoria = (id: string) => dispatch({ type: 'DELETE_CATEGORIA', payload: id });

  const addFornecedor = (fornecedor: Fornecedor) => dispatch({ type: 'ADD_FORNECEDOR', payload: fornecedor });
  const updateFornecedor = (fornecedor: Fornecedor) => dispatch({ type: 'UPDATE_FORNECEDOR', payload: fornecedor });
  const deleteFornecedor = (id: string) => dispatch({ type: 'DELETE_FORNECEDOR', payload: id });

  const addInsumo = (insumo: Insumo) => dispatch({ type: 'ADD_INSUMO', payload: insumo });
  const updateInsumo = (insumo: Insumo) => dispatch({ type: 'UPDATE_INSUMO', payload: insumo });
  const deleteInsumo = (id: string) => dispatch({ type: 'DELETE_INSUMO', payload: id });

  const addReceita = (receita: Receita) => dispatch({ type: 'ADD_RECEITA', payload: receita });
  const updateReceita = (receita: Receita) => dispatch({ type: 'UPDATE_RECEITA', payload: receita });
  const deleteReceita = (id: string) => dispatch({ type: 'DELETE_RECEITA', payload: id });

  const addCopoBase = (copoBase: CopoBase) => dispatch({ type: 'ADD_COPO_BASE', payload: copoBase });
  const updateCopoBase = (copoBase: CopoBase) => dispatch({ type: 'UPDATE_COPO_BASE', payload: copoBase });
  const deleteCopoBase = (id: string) => dispatch({ type: 'DELETE_COPO_BASE', payload: id });

  const addCombinado = (combinado: Combinado) => dispatch({ type: 'ADD_COMBINADO', payload: combinado });
  const updateCombinado = (combinado: Combinado) => dispatch({ type: 'UPDATE_COMBINADO', payload: combinado });
  const deleteCombinado = (id: string) => dispatch({ type: 'DELETE_COMBINADO', payload: id });

  const addItemCardapio = (item: ItemCardapio) => dispatch({ type: 'ADD_ITEM_CARDAPIO', payload: item });
  const updateItemCardapio = (item: ItemCardapio) => dispatch({ type: 'UPDATE_ITEM_CARDAPIO', payload: item });
  const deleteItemCardapio = (id: string) => dispatch({ type: 'DELETE_ITEM_CARDAPIO', payload: id });

  // Vendas action functions
  const initImportacao = (importacao: ImportacaoVendas) => dispatch({ type: 'INIT_IMPORTACAO', payload: importacao });
  const addVendasRegistradas = (vendas: VendaRegistrada[]) => dispatch({ type: 'ADD_VENDAS_REGISTRADAS', payload: vendas });
  const updateSystemInfo = (info: VendasSystemInfo) => dispatch({ type: 'UPDATE_SYSTEM_INFO', payload: info });
  const setVendasFiltros = (filtros: FiltrosVendas) => dispatch({ type: 'SET_VENDAS_FILTROS', payload: filtros });
  const resolveProdutoMatch = (vendaId: string, itemCardapioId: string) => dispatch({ type: 'RESOLVE_PRODUTO_MATCH', payload: { vendaId, itemCardapioId } });
  const updateDashboardVendas = (data: DashboardVendas) => dispatch({ type: 'UPDATE_DASHBOARD_VENDAS', payload: data });

  // Financial action functions
  const setCustosOperacionais = (custos: CustoOperacional[]) => dispatch({ type: 'SET_CUSTOS_OPERACIONAIS', payload: custos });
  const addCustoOperacional = (custo: CustoOperacional) => dispatch({ type: 'ADD_CUSTO_OPERACIONAL', payload: custo });
  const updateCustoOperacional = (custo: CustoOperacional) => dispatch({ type: 'UPDATE_CUSTO_OPERACIONAL', payload: custo });
  const deleteCustoOperacional = (id: string) => dispatch({ type: 'DELETE_CUSTO_OPERACIONAL', payload: id });
  const setDashboardGestaoPeriodo = (periodo: PeriodoDashboard) => dispatch({ type: 'SET_DASHBOARD_GESTAO_PERIODO', payload: periodo });
  const updateDashboardGestaoMetricas = (metricas: DashboardGestaoMetricas) => dispatch({ type: 'UPDATE_DASHBOARD_GESTAO_METRICAS', payload: metricas });
  const setDashboardGestaoLoading = (loading: boolean) => dispatch({ type: 'SET_DASHBOARD_GESTAO_LOADING', payload: loading });

  // Period management functions
  const setPeriodoGestao = (periodo: PeriodoImportacao | null) => dispatch({ type: 'SET_PERIODO_GESTAO', payload: periodo });
  const addCustosPorPeriodo = (periodo: string, custos: CustoOperacional[]) => dispatch({ type: 'ADD_CUSTOS_POR_PERIODO', payload: { periodo, custos } });
  const updateStatusPeriodo = (periodo: string, status: StatusPeriodo) => dispatch({ type: 'UPDATE_STATUS_PERIODO', payload: { periodo, status } });
  const validatePeriodoConsistency = () => dispatch({ type: 'VALIDATE_PERIODO_CONSISTENCY', payload: void 0 });

  // Price helper functions
  const getPrecoVendaItem = (tipo: 'INSUMO' | 'RECEITA' | 'COPO_BASE', itemId: string): number | null => {
    const itemCardapio = state.cardapio.find(item => {
      switch (tipo) {
        case 'INSUMO':
          return item.tipo === 'INSUMO' && item.insumoId === itemId;
        case 'RECEITA':
          return item.tipo === 'RECEITA' && item.receitaId === itemId;
        case 'COPO_BASE':
          return item.tipo === 'COPO_BASE' && item.copoBaseId === itemId;
        default:
          return false;
      }
    });

    return itemCardapio?.precoAtual ?? null;
  };

  const contextValue: AppContextValue = {
    // State
    state,
    dispatch,

    // Auth getters
    user: state.user,
    session: state.session,
    authLoading: state.authLoading,
    isAuthenticated: !!state.user,

    // User profile getters
    userProfile: state.userProfile,

    // Data getters
    configuracao: state.configuracao,
    categorias: state.categorias,
    unidadesMedida: state.unidadesMedida,
    fornecedores: state.fornecedores,
    insumoFornecedores: state.insumoFornecedores,
    insumos: state.insumos,
    receitas: state.receitas,
    coposBase: state.coposBase,
    combinados: state.combinados,
    cardapio: state.cardapio,
    alertas: state.alertas,

    // Vendas getters
    vendasAnalise: state.vendasAnalise,

    // Financial getters
    custosOperacionais: state.custosOperacionais,
    dashboardGestao: state.dashboardGestao,

    // Period management getters
    periodoAtualGestao: state.periodoAtualGestao,
    custosOperacionaisPorPeriodo: state.custosOperacionaisPorPeriodo,
    statusPeriodos: state.statusPeriodos,

    // Auth actions
    setUser,
    setSession,
    setAuthLoading,

    // User profile actions
    setUserProfile,
    updateUserProfile,
    updateUserAvatar,
    getUserProfile,
    saveUserProfileToStorage,

    // Action functions
    addCategoria,
    updateCategoria,
    deleteCategoria,
    addFornecedor,
    updateFornecedor,
    deleteFornecedor,
    addInsumo,
    updateInsumo,
    deleteInsumo,
    addReceita,
    updateReceita,
    deleteReceita,
    addCopoBase,
    updateCopoBase,
    deleteCopoBase,
    addCombinado,
    updateCombinado,
    deleteCombinado,
    addItemCardapio,
    updateItemCardapio,
    deleteItemCardapio,

    // Vendas actions
    initImportacao,
    addVendasRegistradas,
    updateSystemInfo,
    setVendasFiltros,
    resolveProdutoMatch,
    updateDashboardVendas,

    // Financial actions
    setCustosOperacionais,
    addCustoOperacional,
    updateCustoOperacional,
    deleteCustoOperacional,
    setDashboardGestaoPeriodo,
    updateDashboardGestaoMetricas,
    setDashboardGestaoLoading,

    // Period management actions
    setPeriodoGestao,
    addCustosPorPeriodo,
    updateStatusPeriodo,
    validatePeriodoConsistency,

    // Price helper functions
    getPrecoVendaItem,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Hook
export const useAppContext = (): AppContextValue => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};