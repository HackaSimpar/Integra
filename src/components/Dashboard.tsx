import React, { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '../context/AuthContext';
import { LogOut, Plus, Users, Calendar as CalendarIcon, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Employee {
  id: number;
  name: string;
  company: string;
  expected_admission_date: string;
  effective_admission_date: string | null;
  orientation_date: string;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Form state
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [orientationDate, setOrientationDate] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchEmployees = async () => {
    const res = await fetch('/api/employees');
    const data = await res.json();
    setEmployees(data);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          company,
          expected_admission_date: expectedDate,
          effective_admission_date: effectiveDate,
          orientation_date: orientationDate
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Colaborador adicionado com sucesso!');
        setName('');
        setCompany('');
        setExpectedDate('');
        setEffectiveDate('');
        setOrientationDate('');
        fetchEmployees();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Erro ao conectar ao servidor');
    }
  };

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start on Monday
  const weekDays = [0, 1, 2, 3].map(i => addDays(weekStart, i)); // Mon to Thu

  const getCapacity = (date: Date) => {
    const day = date.getDay();
    if (day === 1) return { room: 'Auditório', max: 140 };
    if (day >= 2 && day <= 4) return { room: 'Sala Parauapebas', max: 25 };
    return { room: 'Fechado', max: 0 };
  };

  const getCountForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return employees.filter(e => e.orientation_date === dateStr).length;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-[var(--color-primary)] mr-3" />
              <span className="text-xl font-semibold text-gray-900">Integração Institucional</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Olá, {user?.username}</span>
              {user?.role === 'admin' && (
                <button
                  onClick={() => navigate('/admin')}
                  className="p-2 text-gray-500 hover:text-[var(--color-primary)] transition-colors"
                  title="Administração"
                >
                  <Settings size={20} />
                </button>
              )}
              <button
                onClick={logout}
                className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                title="Sair"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Calendar / Capacity View */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <CalendarIcon className="mr-2 h-5 w-5 text-gray-500" />
                  Controle de Vagas
                </h2>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setCurrentDate(addDays(currentDate, -7))}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Semana Anterior
                  </button>
                  <button 
                    onClick={() => setCurrentDate(addDays(currentDate, 7))}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Próxima Semana
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {weekDays.map(date => {
                  const { room, max } = getCapacity(date);
                  const count = getCountForDate(date);
                  const percentage = Math.min(100, (count / max) * 100);
                  const isFull = count >= max;

                  return (
                    <div key={date.toISOString()} className={`p-4 rounded-lg border ${isFull ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
                      <div className="text-sm font-medium text-gray-500 mb-1 capitalize">
                        {format(date, 'EEEE', { locale: ptBR })}
                      </div>
                      <div className="text-lg font-bold text-gray-900 mb-1">
                        {format(date, 'dd/MM')}
                      </div>
                      <div className="text-xs text-gray-600 mb-3">{room}</div>
                      
                      <div className="flex justify-between text-sm mb-1">
                        <span className={isFull ? 'text-red-700 font-medium' : 'text-gray-700'}>
                          {count} / {max}
                        </span>
                        <span className="text-gray-500">vagas</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${isFull ? 'bg-red-500' : 'bg-[var(--color-primary)]'}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* List of Employees for the week */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Colaboradores Agendados (Semana)</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Integração</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {employees
                      .filter(e => {
                        const d = parseISO(e.orientation_date);
                        return d >= weekStart && d <= addDays(weekStart, 4);
                      })
                      .sort((a, b) => a.orientation_date.localeCompare(b.orientation_date))
                      .map(emp => (
                      <tr key={emp.id}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{emp.name}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{emp.company}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {format(parseISO(emp.orientation_date), 'dd/MM/yyyy')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Plus className="mr-2 h-5 w-5 text-[var(--color-primary)]" />
                Novo Colaborador
              </h2>

              {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}
              {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">{success}</div>}

              <form onSubmit={handleAddEmployee} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data Prevista de Admissão</label>
                  <input
                    type="date"
                    required
                    value={expectedDate}
                    onChange={e => setExpectedDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data Efetiva de Admissão (Opcional)</label>
                  <input
                    type="date"
                    value={effectiveDate}
                    onChange={e => setEffectiveDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data da Integração</label>
                  <input
                    type="date"
                    required
                    value={orientationDate}
                    onChange={e => setOrientationDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">Apenas Segunda a Quinta-feira.</p>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-[var(--color-primary)] hover:opacity-90 text-white rounded-md font-medium transition-opacity mt-4"
                >
                  Agendar Integração
                </button>
              </form>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
