
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, ArrowUpDown, Filter } from "lucide-react";

interface FinancialItem {
  date: string;
  receita: number;
  despesa: number;
  categoria: string;
}

interface FinancialItemsListProps {
  data: FinancialItem[];
}

type SortField = 'date' | 'receita' | 'despesa' | 'categoria' | 'valor';
type SortOrder = 'asc' | 'desc';

export function FinancialItemsList({ data }: FinancialItemsListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Expandir dados para mostrar receitas e despesas separadamente
  const expandedData = useMemo(() => {
    const items: Array<{
      date: string;
      categoria: string;
      tipo: 'Receita' | 'Despesa';
      valor: number;
    }> = [];

    data.forEach(item => {
      if (item.receita > 0) {
        items.push({
          date: item.date,
          categoria: item.categoria,
          tipo: 'Receita',
          valor: item.receita
        });
      }
      if (item.despesa > 0) {
        items.push({
          date: item.date,
          categoria: item.categoria,
          tipo: 'Despesa',
          valor: item.despesa
        });
      }
    });

    return items;
  }, [data]);

  // Obter categorias únicas
  const categories = useMemo(() => {
    const cats = new Set(expandedData.map(item => item.categoria));
    return Array.from(cats).sort();
  }, [expandedData]);

  // Filtrar e ordenar dados
  const filteredAndSortedData = useMemo(() => {
    let filtered = expandedData.filter(item => {
      const matchesSearch = item.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.tipo.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === "all" || item.categoria === filterCategory;
      const matchesType = filterType === "all" || 
                         (filterType === "receita" && item.tipo === "Receita") ||
                         (filterType === "despesa" && item.tipo === "Despesa");
      
      return matchesSearch && matchesCategory && matchesType;
    });

    // Ordenar
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortField) {
        case 'date':
          aValue = a.date;
          bValue = b.date;
          break;
        case 'categoria':
          aValue = a.categoria;
          bValue = b.categoria;
          break;
        case 'valor':
          aValue = a.valor;
          bValue = b.valor;
          break;
        default:
          aValue = a.date;
          bValue = b.date;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [expandedData, searchTerm, filterCategory, filterType, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const totalReceitas = filteredAndSortedData.filter(item => item.tipo === 'Receita').reduce((sum, item) => sum + item.valor, 0);
  const totalDespesas = filteredAndSortedData.filter(item => item.tipo === 'Despesa').reduce((sum, item) => sum + item.valor, 0);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Filter className="w-5 h-5" />
          <span>Lista Detalhada de Movimentações</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por categoria ou tipo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full md:w-32">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="receita">Receitas</SelectItem>
              <SelectItem value="despesa">Despesas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
            <p className="text-sm text-green-600 dark:text-green-400">Total Receitas</p>
            <p className="text-lg font-semibold text-green-700 dark:text-green-300">{formatCurrency(totalReceitas)}</p>
          </div>
          <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">Total Despesas</p>
            <p className="text-lg font-semibold text-red-700 dark:text-red-300">{formatCurrency(totalDespesas)}</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
            <p className="text-sm text-blue-600 dark:text-blue-400">Saldo</p>
            <p className={`text-lg font-semibold ${totalReceitas - totalDespesas >= 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
              {formatCurrency(totalReceitas - totalDespesas)}
            </p>
          </div>
        </div>

        {/* Tabela */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('date')} className="h-auto p-0 font-semibold">
                    Data <ArrowUpDown className="ml-1 w-4 h-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('categoria')} className="h-auto p-0 font-semibold">
                    Categoria <ArrowUpDown className="ml-1 w-4 h-4" />
                  </Button>
                </TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">
                  <Button variant="ghost" onClick={() => handleSort('valor')} className="h-auto p-0 font-semibold">
                    Valor <ArrowUpDown className="ml-1 w-4 h-4" />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Nenhum item encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.date}</TableCell>
                    <TableCell>{item.categoria}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.tipo === 'Receita' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {item.tipo}
                      </span>
                    </TableCell>
                    <TableCell className={`text-right font-medium ${
                      item.tipo === 'Receita' 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {formatCurrency(item.valor)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          Mostrando {filteredAndSortedData.length} de {expandedData.length} itens
        </div>
      </CardContent>
    </Card>
  );
}
