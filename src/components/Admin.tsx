import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Palette, Trash2, FileText } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface User {
  id: number;
  username: string;
  role: string;
}

interface Employee {
  id: number;
  name: string;
  company: string;
  expected_admission_date: string;
  effective_admission_date: string | null;
  orientation_date: string;
}

export default function Admin() {
  const { user } = useAuth();
  const { settings, updateSettings } = useSettings();
  const navigate = useNavigate();
  
  const [users, setUsers] = useState<User[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'settings' | 'reports'>('users');
  
  // New user form
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('recruiter');
  
  // Settings form
  const [primaryColor, setPrimaryColor] = useState(settings.primaryColor);

  useEffect(() => {
    fetchUsers();
    fetchEmployees();
  }, []);

  const fetchUsers = async () => {
    const res = await fetch('/api/users');
    const data = await res.json();
    setUsers(data);
  };

  const fetchEmployees = async () => {
    const res = await fetch('/api/employees');
    const data = await res.json();
    setEmployees(data);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: newUsername, password: newPassword, role: newRole }),
    });
    setNewUsername('');
    setNewPassword('');
    fetchUsers();
  };

  const handleDeleteUser = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      await fetch(`/api/users/${id}`, { method: 'DELETE' });
      fetchUsers();
    }
  };

  const handleDeleteEmployee = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este registro?')) {
      await fetch(`/api/employees/${id}`, { method: 'DELETE' });
      fetchEmployees();
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({ primaryColor });
    alert('Configurações salvas com sucesso!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button onClick={() => navigate('/')} className="mr-4 text-gray-500 hover:text-gray-900">
                <ArrowLeft size={24} />
              </button>
              <span className="text-xl font-semibold text-gray-900">Painel Administrativo</span>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-600">Admin: {user?.username}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 space-y-2">
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'users' ? 'bg-[var(--color-primary)] text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <Users className="mr-3 h-5 w-5" />
              Usuários
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'settings' ? 'bg-[var(--color-primary)] text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <Palette className="mr-3 h-5 w-5" />
              Aparência
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'reports' ? 'bg-[var(--color-primary)] text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <FileText className="mr-3 h-5 w-5" />
              Relatórios
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            
            {activeTab === 'users' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Gerenciar Usuários</h2>
                
                <form onSubmit={handleAddUser} className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Adicionar Novo Usuário</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Usuário</label>
                      <input type="text" required value={newUsername} onChange={e => setNewUsername(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Senha</label>
                      <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Perfil</label>
                      <select value={newRole} onChange={e => setNewRole(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                        <option value="recruiter">Recrutador</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </div>
                    <button type="submit" className="w-full py-2 px-4 bg-[var(--color-primary)] text-white rounded-md text-sm font-medium">
                      Adicionar
                    </button>
                  </div>
                </form>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuário</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Perfil</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {users.map(u => (
                        <tr key={u.id}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{u.id}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{u.username}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 capitalize">{u.role}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                            <button onClick={() => handleDeleteUser(u.id)} className="text-red-600 hover:text-red-900" disabled={u.username === 'Felipe'}>
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Aparência do Sistema</h2>
                <form onSubmit={handleSaveSettings} className="max-w-md space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cor Principal (Tema)</label>
                    <div className="flex items-center space-x-4">
                      <input 
                        type="color" 
                        value={primaryColor} 
                        onChange={e => setPrimaryColor(e.target.value)}
                        className="h-10 w-20 p-1 border border-gray-300 rounded cursor-pointer"
                      />
                      <input 
                        type="text" 
                        value={primaryColor} 
                        onChange={e => setPrimaryColor(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                      />
                    </div>
                  </div>
                  <button type="submit" className="py-2 px-4 bg-[var(--color-primary)] text-white rounded-md font-medium">
                    Salvar Configurações
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'reports' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Relatório Geral de Integrações</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Empresa</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prev. Admissão</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Efet. Admissão</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data Integração</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {employees.sort((a, b) => b.orientation_date.localeCompare(a.orientation_date)).map(emp => (
                        <tr key={emp.id}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{emp.name}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{emp.company}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{format(parseISO(emp.expected_admission_date), 'dd/MM/yyyy')}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{emp.effective_admission_date ? format(parseISO(emp.effective_admission_date), 'dd/MM/yyyy') : '-'}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{format(parseISO(emp.orientation_date), 'dd/MM/yyyy')}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                            <button onClick={() => handleDeleteEmployee(emp.id)} className="text-red-600 hover:text-red-900">
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
