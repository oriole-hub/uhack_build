import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

export default function JoinOrganizationPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const joinOrganization = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setStatus('error');
          setMessage('Вы не авторизованы. Пожалуйста, войдите в систему.');
          return;
        }
        const response = await apiService.joinOrganization(code);
        setStatus('success');
        setMessage('Вы успешно присоединились к организации!');
        setTimeout(() => navigate('/dashboard'), 2000);
      } catch (error) {
        setStatus('error');
        setMessage(error.message || 'Не удалось присоединиться к организации.');
      }
    };
    joinOrganization();
  }, [code, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center px-4">
      {status === 'loading' && (
        <>
          <h1 className="text-xl font-semibold mb-2">
            Присоединяемся к организации...
          </h1>
          <p className="text-gray-500">Пожалуйста, подождите.</p>
        </>
      )}

      {status === 'success' && (
        <>
          <h1 className="text-xl font-semibold text-green-600 mb-2">
            🎉 Успех!
          </h1>
          <p>{message}</p>
        </>
      )}

      {status === 'error' && (
        <>
          <h1 className="text-xl font-semibold text-red-600 mb-2">Ошибка</h1>
          <p>{message}</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Войти
          </button>
        </>
      )}
    </div>
  );
}
