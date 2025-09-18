import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
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
import {
  mockCategorias,
  mockUnidadesMedida,
  mockFornecedores,
  mockInsumoFornecedores,
  mockInsumos,
  mockReceitas,
  mockCoposBase,
  mockCombinados,
  mockCardapio
} from '@/data/mockData';

// App State Interface
interface AppState {
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
  loading: boolean;
  error: string | null;
}

// Action Types
type AppAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
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
  | { type: 'MARK_ALERTA_READ'; payload: string };

// Initial State
const initialState: AppState = {
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
    
    default:
      return state;
  }
};

// Enhanced Context with helper functions
interface AppContextValue {
  // State
  state: AppState;
  dispatch: React.Dispatch<AppAction>;

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

  // Price helper functions
  getPrecoVendaItem: (tipo: 'INSUMO' | 'RECEITA' | 'COPO_BASE', itemId: string) => number | null;
}

const AppContext = createContext<AppContextValue | null>(null);

// Provider
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

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

    return itemCardapio?.precoAtual || null;
  };

  const contextValue: AppContextValue = {
    // State
    state,
    dispatch,

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