import React, { useState, useEffect } from 'react';
import {
  initAuth,
  googleSignIn,
  googleSignOut,
  listDriveFiles,
  searchDriveFiles,
  uploadDriveTextFile,
  deleteDriveFile,
  listGmailMessages,
  sendGmailMessage,
  listCalendarEvents,
  createCalendarEvent,
  deleteCalendarEvent,
  listContacts,
  createContact,
  deleteContact,
  type DriveFileItem,
  type GmailMessageItem,
  type CalendarEventItem,
  type ContactItem,
} from '../../services/googleWorkspace';
import type { User } from 'firebase/auth';
import {
  HardDrive,
  Mail,
  Calendar,
  Users,
  Search,
  Plus,
  Trash2,
  Send,
  RefreshCw,
  LogOut,
  AlertTriangle,
  FileText,
  Clock,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { playUiClick } from '../../utils/audio';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirmar',
  isDestructive = true,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-red-500/50 rounded-xl p-5 max-w-md w-full shadow-2xl space-y-4">
        <div className="flex items-center gap-3 text-red-400">
          <AlertTriangle className="w-6 h-6 shrink-0" />
          <h3 className="text-lg font-bold text-zinc-100 font-mono">{title}</h3>
        </div>
        <p className="text-sm text-zinc-300 font-sans leading-relaxed">{description}</p>
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={() => {
              playUiClick();
              onCancel();
            }}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              playUiClick();
              onConfirm();
            }}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors text-white ${
              isDestructive ? 'bg-red-600 hover:bg-red-500' : 'bg-rose-600 hover:bg-rose-500'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export const GoogleWorkspaceView: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<'drive' | 'gmail' | 'calendar' | 'contacts'>('drive');

  // Loading states
  const [loadingData, setLoadingData] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Data states
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [driveSearchQuery, setDriveSearchQuery] = useState('');
  const [isUploadingDrive, setIsUploadingDrive] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileContent, setNewFileContent] = useState('');

  const [gmailMessages, setGmailMessages] = useState<GmailMessageItem[]>([]);
  const [isComposingMail, setIsComposingMail] = useState(false);
  const [mailTo, setMailTo] = useState('');
  const [mailSubject, setMailSubject] = useState('');
  const [mailBody, setMailBody] = useState('');

  const [calendarEvents, setCalendarEvents] = useState<CalendarEventItem[]>([]);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [eventSummary, setEventSummary] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventStart, setEventStart] = useState('');
  const [eventEnd, setEventEnd] = useState('');

  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  // Init Auth
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
        setIsLoadingAuth(false);
      },
      () => {
        setUser(null);
        setToken(null);
        setIsLoadingAuth(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch tab data on auth or tab change
  useEffect(() => {
    if (token) {
      loadCurrentTabData();
    }
  }, [token, activeTab]);

  const loadCurrentTabData = async () => {
    if (!token) return;
    setLoadingData(true);
    setErrorMsg(null);
    try {
      if (activeTab === 'drive') {
        const files = await listDriveFiles();
        setDriveFiles(files);
      } else if (activeTab === 'gmail') {
        const msgs = await listGmailMessages();
        setGmailMessages(msgs);
      } else if (activeTab === 'calendar') {
        const evts = await listCalendarEvents();
        setCalendarEvents(evts);
      } else if (activeTab === 'contacts') {
        const list = await listContacts();
        setContacts(list);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error cargando datos de Google Workspace');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSignIn = async () => {
    setIsLoadingAuth(true);
    setErrorMsg(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        setSuccessMsg('¡Conectado exitosamente con Google Workspace!');
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al iniciar sesión con Google.');
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleSignOut = async () => {
    await googleSignOut();
    setUser(null);
    setToken(null);
    setDriveFiles([]);
    setGmailMessages([]);
    setCalendarEvents([]);
    setContacts([]);
  };

  // ----------------------------------------------------
  // Google Drive Handlers
  // ----------------------------------------------------
  const handleSearchDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driveSearchQuery.trim()) {
      return loadCurrentTabData();
    }
    setLoadingData(true);
    setErrorMsg(null);
    try {
      const results = await searchDriveFiles(driveSearchQuery);
      setDriveFiles(results);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error buscando archivos en Drive');
    } finally {
      setLoadingData(false);
    }
  };

  const handleUploadDriveFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    setLoadingData(true);
    try {
      await uploadDriveTextFile(newFileName, newFileContent);
      setNewFileName('');
      setNewFileContent('');
      setIsUploadingDrive(false);
      setSuccessMsg(`Archivo "${newFileName}" guardado en Google Drive.`);
      setTimeout(() => setSuccessMsg(null), 3000);
      loadCurrentTabData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al subir archivo a Drive');
    } finally {
      setLoadingData(false);
    }
  };

  const confirmDeleteDriveFile = (file: DriveFileItem) => {
    setConfirmModal({
      isOpen: true,
      title: '¿Eliminar archivo de Google Drive?',
      description: `¿Estás seguro de que deseas eliminar permanentemente "${file.name}"? Esta acción no se puede deshacer.`,
      confirmLabel: 'Eliminar Archivo',
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        setLoadingData(true);
        try {
          await deleteDriveFile(file.id);
          setSuccessMsg(`Archivo "${file.name}" eliminado de Drive.`);
          setTimeout(() => setSuccessMsg(null), 3000);
          loadCurrentTabData();
        } catch (err: any) {
          setErrorMsg(err.message || 'Error al eliminar archivo');
        } finally {
          setLoadingData(false);
        }
      },
    });
  };

  // ----------------------------------------------------
  // Gmail Handlers
  // ----------------------------------------------------
  const confirmSendMail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mailTo.trim() || !mailSubject.trim() || !mailBody.trim()) return;

    setConfirmModal({
      isOpen: true,
      title: '¿Enviar correo electrónico?',
      description: `Se enviará un correo a "${mailTo}" con el asunto "${mailSubject}". ¿Confirmas el envío?`,
      confirmLabel: 'Enviar Correo',
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        setLoadingData(true);
        try {
          await sendGmailMessage({ to: mailTo, subject: mailSubject, body: mailBody });
          setMailTo('');
          setMailSubject('');
          setMailBody('');
          setIsComposingMail(false);
          setSuccessMsg('¡Correo enviado con éxito!');
          setTimeout(() => setSuccessMsg(null), 3000);
          loadCurrentTabData();
        } catch (err: any) {
          setErrorMsg(err.message || 'Error al enviar correo.');
        } finally {
          setLoadingData(false);
        }
      },
    });
  };

  // ----------------------------------------------------
  // Calendar Handlers
  // ----------------------------------------------------
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventSummary.trim() || !eventStart) return;
    setLoadingData(true);
    try {
      const startDate = new Date(eventStart).toISOString();
      const endDate = eventEnd
        ? new Date(eventEnd).toISOString()
        : new Date(new Date(eventStart).getTime() + 60 * 60 * 1000).toISOString();

      await createCalendarEvent({
        summary: eventSummary,
        description: eventDescription,
        startDateTime: startDate,
        endDateTime: endDate,
      });

      setEventSummary('');
      setEventDescription('');
      setEventStart('');
      setEventEnd('');
      setIsAddingEvent(false);
      setSuccessMsg('Evento añadido al calendario.');
      setTimeout(() => setSuccessMsg(null), 3000);
      loadCurrentTabData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error creando evento de calendario');
    } finally {
      setLoadingData(false);
    }
  };

  const confirmDeleteCalendarEvent = (event: CalendarEventItem) => {
    setConfirmModal({
      isOpen: true,
      title: '¿Eliminar evento de Google Calendar?',
      description: `¿Estás seguro de que deseas eliminar el evento "${event.summary}"?`,
      confirmLabel: 'Eliminar Evento',
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        setLoadingData(true);
        try {
          await deleteCalendarEvent(event.id);
          setSuccessMsg('Evento eliminado.');
          setTimeout(() => setSuccessMsg(null), 3000);
          loadCurrentTabData();
        } catch (err: any) {
          setErrorMsg(err.message || 'Error eliminando evento');
        } finally {
          setLoadingData(false);
        }
      },
    });
  };

  // ----------------------------------------------------
  // Contacts Handlers
  // ----------------------------------------------------
  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim()) return;
    setLoadingData(true);
    try {
      await createContact({
        givenName: contactName,
        email: contactEmail,
        phone: contactPhone,
      });
      setContactName('');
      setContactEmail('');
      setContactPhone('');
      setIsAddingContact(false);
      setSuccessMsg(`Contacto "${contactName}" agregado.`);
      setTimeout(() => setSuccessMsg(null), 3000);
      loadCurrentTabData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error creando contacto');
    } finally {
      setLoadingData(false);
    }
  };

  const confirmDeleteContact = (c: ContactItem) => {
    setConfirmModal({
      isOpen: true,
      title: '¿Eliminar contacto de Google Contacts?',
      description: `¿Estás seguro de eliminar a "${c.displayName}" de tus contactos?`,
      confirmLabel: 'Eliminar Contacto',
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        setLoadingData(true);
        try {
          await deleteContact(c.resourceName);
          setSuccessMsg(`Contacto "${c.displayName}" eliminado.`);
          setTimeout(() => setSuccessMsg(null), 3000);
          loadCurrentTabData();
        } catch (err: any) {
          setErrorMsg(err.message || 'Error al eliminar contacto');
        } finally {
          setLoadingData(false);
        }
      },
    });
  };

  return (
    <div className="h-full flex flex-col bg-zinc-950/80 text-zinc-100 font-sans p-4 space-y-4">
      {/* Top Header & Auth State */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-600/20 text-red-500 rounded-lg border border-red-500/30">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-100 font-mono tracking-wider flex items-center gap-2">
              GOOGLE WORKSPACE SUITE
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-950 text-rose-400 border border-rose-800">
                OAUTH V2
              </span>
            </h2>
            <p className="text-xs text-zinc-400">
              Integración nativa con Google Drive, Gmail, Calendar y Contacts
            </p>
          </div>
        </div>

        {/* User Info / Sign In Button */}
        {user ? (
          <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg">
            {user.photoURL && (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="w-7 h-7 rounded-full border border-red-500/40"
              />
            )}
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold text-zinc-200 leading-tight">
                {user.displayName || 'Usuario Google'}
              </p>
              <p className="text-[10px] text-zinc-400 leading-tight">{user.email}</p>
            </div>
            <button
              onClick={() => {
                playUiClick();
                handleSignOut();
              }}
              title="Cerrar sesión"
              className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div>
            {/* Styled "Sign in with Google" button per standard specs */}
            <button
              onClick={() => {
                playUiClick();
                handleSignIn();
              }}
              disabled={isLoadingAuth}
              className="flex items-center gap-2.5 px-3.5 py-2 bg-white text-zinc-800 font-medium text-xs rounded-lg shadow-sm hover:bg-zinc-100 transition-colors border border-zinc-300 disabled:opacity-60 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 48 48">
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
              </svg>
              <span>{isLoadingAuth ? 'Conectando...' : 'Sign in with Google'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Alert Notices */}
      {errorMsg && (
        <div className="bg-red-950/60 border border-red-800 text-red-200 text-xs px-3 py-2 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs px-3 py-2 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {!user ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
          <div className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-xl">
            <HardDrive className="w-12 h-12 text-rose-500 mx-auto mb-2 opacity-80" />
            <h3 className="text-base font-bold text-zinc-200 font-mono">
              Inicia sesión con Google para desbloquear Workspace
            </h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto mt-2 leading-relaxed">
              Conecta tu cuenta para sincronizar archivos de Google Drive, bandeja de entrada y envío de Gmail, eventos de Google Calendar y contactos personales directamente desde WADE-OS.
            </p>
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => {
                  playUiClick();
                  handleSignIn();
                }}
                disabled={isLoadingAuth}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-zinc-900 font-medium text-sm rounded-lg hover:bg-zinc-100 transition-all shadow-md cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                </svg>
                <span>Conectar con Google</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden space-y-3">
          {/* Sub Navigation Tabs */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  playUiClick();
                  setActiveTab('drive');
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors ${
                  activeTab === 'drive'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                <HardDrive className="w-3.5 h-3.5" />
                <span>Drive ({driveFiles.length})</span>
              </button>
              <button
                onClick={() => {
                  playUiClick();
                  setActiveTab('gmail');
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors ${
                  activeTab === 'gmail'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Gmail ({gmailMessages.length})</span>
              </button>
              <button
                onClick={() => {
                  playUiClick();
                  setActiveTab('calendar');
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors ${
                  activeTab === 'calendar'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Calendar ({calendarEvents.length})</span>
              </button>
              <button
                onClick={() => {
                  playUiClick();
                  setActiveTab('contacts');
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors ${
                  activeTab === 'contacts'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Contacts ({contacts.length})</span>
              </button>
            </div>

            <button
              onClick={() => {
                playUiClick();
                loadCurrentTabData();
              }}
              title="Refrescar datos"
              className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin text-rose-400' : ''}`} />
            </button>
          </div>

          {/* Tab 1: Google Drive */}
          {activeTab === 'drive' && (
            <div className="flex-1 flex flex-col overflow-hidden space-y-3">
              <div className="flex items-center gap-2">
                <form onSubmit={handleSearchDrive} className="flex-1 relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500" />
                  <input
                    type="text"
                    value={driveSearchQuery}
                    onChange={(e) => setDriveSearchQuery(e.target.value)}
                    placeholder="Buscar archivos en Google Drive..."
                    className="w-full bg-zinc-900 border border-zinc-800 pl-9 pr-3 py-1.5 text-xs rounded-lg text-zinc-200 focus:outline-hidden focus:border-red-500"
                  />
                </form>
                <button
                  onClick={() => setIsUploadingDrive(!isUploadingDrive)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-mono font-semibold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nuevo Archivo</span>
                </button>
              </div>

              {/* Upload Form */}
              {isUploadingDrive && (
                <form
                  onSubmit={handleUploadDriveFile}
                  className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-mono font-bold text-zinc-200">
                      Crear nota/documento de texto en Google Drive
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsUploadingDrive(false)}
                      className="text-zinc-400 text-xs hover:text-zinc-200"
                    >
                      ✕
                    </button>
                  </div>
                  <input
                    type="text"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    placeholder="Nombre del archivo (ej. informe_tactico.txt)"
                    className="w-full bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-xs rounded-lg text-zinc-200 focus:outline-hidden focus:border-red-500"
                    required
                  />
                  <textarea
                    value={newFileContent}
                    onChange={(e) => setNewFileContent(e.target.value)}
                    placeholder="Contenido del archivo..."
                    rows={3}
                    className="w-full bg-zinc-950 border border-zinc-800 p-2 text-xs rounded-lg text-zinc-200 focus:outline-hidden focus:border-red-500"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="submit"
                      disabled={loadingData}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg"
                    >
                      Guardar en Drive
                    </button>
                  </div>
                </form>
              )}

              {/* Drive Files List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {driveFiles.length === 0 ? (
                  <div className="text-center py-12 text-zinc-500 text-xs font-mono">
                    No se encontraron archivos en Google Drive.
                  </div>
                ) : (
                  driveFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-2.5 bg-zinc-900/60 border border-zinc-800/80 rounded-lg hover:border-zinc-700 transition-colors"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <FileText className="w-4 h-4 text-red-400 shrink-0" />
                        <div className="overflow-hidden">
                          <p className="text-xs font-medium text-zinc-200 truncate">{file.name}</p>
                          <p className="text-[10px] text-zinc-500">
                            {file.mimeType} {file.modifiedTime ? `• ${new Date(file.modifiedTime).toLocaleDateString()}` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Abrir en Google Drive"
                            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          onClick={() => confirmDeleteDriveFile(file)}
                          title="Eliminar de Google Drive"
                          className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Gmail */}
          {activeTab === 'gmail' && (
            <div className="flex-1 flex flex-col overflow-hidden space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-400 font-mono">Mensajes recientes en bandeja de entrada</span>
                <button
                  onClick={() => setIsComposingMail(!isComposingMail)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-mono font-semibold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Redactar Correo</span>
                </button>
              </div>

              {/* Compose Modal / Form */}
              {isComposingMail && (
                <form onSubmit={confirmSendMail} className="bg-zinc-900 border border-zinc-800 p-3.5 rounded-xl space-y-2.5">
                  <div className="flex justify-between items-center border-b border-zinc-800 pb-1.5">
                    <h4 className="text-xs font-mono font-bold text-zinc-200 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-red-400" />
                      Redactar Nuevo Mensaje
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsComposingMail(false)}
                      className="text-zinc-400 text-xs hover:text-zinc-200"
                    >
                      ✕
                    </button>
                  </div>
                  <input
                    type="email"
                    value={mailTo}
                    onChange={(e) => setMailTo(e.target.value)}
                    placeholder="Para (destinatario@ejemplo.com)"
                    className="w-full bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-xs rounded-lg text-zinc-200 focus:outline-hidden focus:border-red-500"
                    required
                  />
                  <input
                    type="text"
                    value={mailSubject}
                    onChange={(e) => setMailSubject(e.target.value)}
                    placeholder="Asunto"
                    className="w-full bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-xs rounded-lg text-zinc-200 focus:outline-hidden focus:border-red-500"
                    required
                  />
                  <textarea
                    value={mailBody}
                    onChange={(e) => setMailBody(e.target.value)}
                    placeholder="Cuerpo del mensaje..."
                    rows={4}
                    className="w-full bg-zinc-950 border border-zinc-800 p-2 text-xs rounded-lg text-zinc-200 focus:outline-hidden focus:border-red-500"
                    required
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg"
                    >
                      <Send className="w-3 h-3" />
                      <span>Enviar Mensaje</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Emails List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {gmailMessages.length === 0 ? (
                  <div className="text-center py-12 text-zinc-500 text-xs font-mono">
                    No se encontraron mensajes en la bandeja de entrada.
                  </div>
                ) : (
                  gmailMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className="p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-lg hover:border-zinc-700 transition-colors space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-zinc-100 truncate">{msg.subject || '(Sin asunto)'}</p>
                        <span className="text-[10px] text-zinc-500 shrink-0 ml-2">
                          {msg.date ? new Date(msg.date).toLocaleDateString() : ''}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 font-mono">De: {msg.from}</p>
                      {msg.snippet && (
                        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed bg-zinc-950/40 p-1.5 rounded">
                          {msg.snippet}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Google Calendar */}
          {activeTab === 'calendar' && (
            <div className="flex-1 flex flex-col overflow-hidden space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-400 font-mono">Próximos eventos sincronizados</span>
                <button
                  onClick={() => setIsAddingEvent(!isAddingEvent)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-mono font-semibold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nuevo Evento</span>
                </button>
              </div>

              {/* Add Event Form */}
              {isAddingEvent && (
                <form onSubmit={handleCreateEvent} className="bg-zinc-900 border border-zinc-800 p-3.5 rounded-xl space-y-2.5">
                  <div className="flex justify-between items-center border-b border-zinc-800 pb-1.5">
                    <h4 className="text-xs font-mono font-bold text-zinc-200 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-red-400" />
                      Agendar Evento
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsAddingEvent(false)}
                      className="text-zinc-400 text-xs hover:text-zinc-200"
                    >
                      ✕
                    </button>
                  </div>
                  <input
                    type="text"
                    value={eventSummary}
                    onChange={(e) => setEventSummary(e.target.value)}
                    placeholder="Título del evento (ej. Reunión con Coloso)"
                    className="w-full bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-xs rounded-lg text-zinc-200 focus:outline-hidden focus:border-red-500"
                    required
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-zinc-400 block mb-1">Inicio</label>
                      <input
                        type="datetime-local"
                        value={eventStart}
                        onChange={(e) => setEventStart(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 px-2 py-1 text-xs rounded text-zinc-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-400 block mb-1">Fin (opcional)</label>
                      <input
                        type="datetime-local"
                        value={eventEnd}
                        onChange={(e) => setEventEnd(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 px-2 py-1 text-xs rounded text-zinc-200"
                      />
                    </div>
                  </div>
                  <input
                    type="text"
                    value={eventDescription}
                    onChange={(e) => setEventDescription(e.target.value)}
                    placeholder="Descripción o detalles..."
                    className="w-full bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-xs rounded-lg text-zinc-200 focus:outline-hidden focus:border-red-500"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg"
                    >
                      Guardar Evento
                    </button>
                  </div>
                </form>
              )}

              {/* Events List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {calendarEvents.length === 0 ? (
                  <div className="text-center py-12 text-zinc-500 text-xs font-mono">
                    No hay eventos programados en tu calendario.
                  </div>
                ) : (
                  calendarEvents.map((evt) => (
                    <div
                      key={evt.id}
                      className="p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-lg hover:border-zinc-700 transition-colors flex items-center justify-between"
                    >
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-zinc-100">{evt.summary}</p>
                        <div className="flex items-center gap-2 text-[10px] text-rose-400 font-mono">
                          <Clock className="w-3 h-3" />
                          <span>
                            {evt.start?.dateTime
                              ? new Date(evt.start.dateTime).toLocaleString()
                              : evt.start?.date || 'Todo el día'}
                          </span>
                        </div>
                        {evt.description && (
                          <p className="text-[11px] text-zinc-400">{evt.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => confirmDeleteCalendarEvent(evt)}
                        title="Eliminar evento"
                        className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Tab 4: Google Contacts */}
          {activeTab === 'contacts' && (
            <div className="flex-1 flex flex-col overflow-hidden space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-400 font-mono">Contactos sincronizados de Google</span>
                <button
                  onClick={() => setIsAddingContact(!isAddingContact)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-mono font-semibold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nuevo Contacto</span>
                </button>
              </div>

              {/* Add Contact Form */}
              {isAddingContact && (
                <form onSubmit={handleCreateContact} className="bg-zinc-900 border border-zinc-800 p-3.5 rounded-xl space-y-2.5">
                  <div className="flex justify-between items-center border-b border-zinc-800 pb-1.5">
                    <h4 className="text-xs font-mono font-bold text-zinc-200 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-red-400" />
                      Añadir Contacto
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsAddingContact(false)}
                      className="text-zinc-400 text-xs hover:text-zinc-200"
                    >
                      ✕
                    </button>
                  </div>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Nombre completo"
                    className="w-full bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-xs rounded-lg text-zinc-200 focus:outline-hidden focus:border-red-500"
                    required
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="Correo electrónico"
                      className="w-full bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-xs rounded-lg text-zinc-200 focus:outline-hidden focus:border-red-500"
                    />
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="Teléfono móvil"
                      className="w-full bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-xs rounded-lg text-zinc-200 focus:outline-hidden focus:border-red-500"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg"
                    >
                      Guardar Contacto
                    </button>
                  </div>
                </form>
              )}

              {/* Contacts List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {contacts.length === 0 ? (
                  <div className="text-center py-12 text-zinc-500 text-xs font-mono">
                    No se encontraron contactos en tu cuenta de Google.
                  </div>
                ) : (
                  contacts.map((c) => (
                    <div
                      key={c.resourceName}
                      className="p-2.5 bg-zinc-900/60 border border-zinc-800/80 rounded-lg hover:border-zinc-700 transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        {c.photoUrl ? (
                          <img src={c.photoUrl} alt={c.displayName} className="w-8 h-8 rounded-full border border-zinc-700" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">
                            {c.displayName?.[0] || 'U'}
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-semibold text-zinc-200">{c.displayName}</p>
                          <p className="text-[10px] text-zinc-400 font-mono">
                            {c.email || c.phone || 'Sin datos de contacto'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => confirmDeleteContact(c)}
                        title="Eliminar contacto"
                        className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Dialog for Destructive Operations */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        description={confirmModal.description}
        confirmLabel={confirmModal.confirmLabel}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
