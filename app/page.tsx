"use client";
import { useState, useEffect, useRef } from 'react';
import { MessageCircle, User as UserIcon, Send, Image as ImageIcon, Lock, LogOut } from 'lucide-react';

export default function ChatApp() {
  const [user, setUser] = useState<any>(null);
  const [tab, setTab] = useState('room'); // room, pm, profile
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [image, setImage] = useState('');
  const [authData, setAuthData] = useState({ username: '', password: '' });
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const scrollRef = useRef<any>();

  // Polling messages every 2 seconds
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [user, tab, selectedUser]);

  const fetchMessages = async () => {
    const receiverId = tab === 'pm' ? selectedUser?._id : null;
    const res = await fetch(`/api/messages?senderId=${user._id}&receiverId=${receiverId}`);
    const data = await res.json();
    setMessages(data);
  };

  const handleAuth = async (action: string) => {
    const res = await fetch('/api/auth', {
      method: 'POST',
      body: JSON.stringify({ ...authData, action })
    });
    const data = await res.json();
    if (data._id) setUser(data);
    else alert(data.error);
  };

  const sendMessage = async (e: any) => {
    e.preventDefault();
    if (!input && !image) return;
    const body = {
      senderId: user._id,
      senderName: user.name || user.username,
      text: input,
      image,
      receiverId: tab === 'pm' ? selectedUser?._id : null
    };
    await fetch('/api/messages', { method: 'POST', body: JSON.stringify(body) });
    setInput('');
    setImage('');
    fetchMessages();
  };

  const handleImage = (e: any) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-md border border-slate-200">
          <h1 className="text-2xl font-bold text-slate-800 mb-6 text-center">ChatApp</h1>
          <input className="w-full p-3 mb-3 border rounded-xl" placeholder="Username" onChange={e => setAuthData({...authData, username: e.target.value})} />
          <input className="w-full p-3 mb-6 border rounded-xl" type="password" placeholder="Password" onChange={e => setAuthData({...authData, password: e.target.value})} />
          <div className="flex gap-3">
            <button onClick={() => handleAuth('login')} className="flex-1 bg-blue-600 text-white p-3 rounded-xl font-medium">Login</button>
            <button onClick={() => handleAuth('register')} className="flex-1 bg-slate-100 text-slate-700 p-3 rounded-xl font-medium">Register</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 max-w-2xl mx-auto border-x border-slate-200">
      {/* Header */}
      <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center">
        <h2 className="font-bold text-slate-800 text-lg">
          {tab === 'room' ? 'Public Room' : tab === 'pm' ? `Chat: ${selectedUser?.name || 'Private'}` : 'My Profile'}
        </h2>
        <button onClick={() => setUser(null)}><LogOut size={20} className="text-slate-400" /></button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {tab === 'room' || (tab === 'pm' && selectedUser) ? (
          <>
            {messages.map((m: any, i) => (
              <div key={i} className={`flex flex-col ${m.senderId === user._id ? 'items-end' : 'items-start'}`}>
                <span className="text-xs text-slate-400 mb-1">{m.senderName}</span>
                <div className={`max-w-[80%] p-3 rounded-2xl ${m.senderId === user._id ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'}`}>
                  {m.image && <img src={m.image} className="rounded-lg mb-2 max-h-60 w-full object-cover" />}
                  {m.text && <p>{m.text}</p>}
                </div>
              </div>
            ))}
            <div ref={scrollRef} />
          </>
        ) : tab === 'pm' ? (
          <div className="space-y-2">
            <p className="text-slate-500 mb-4">Pilih user untuk dichat:</p>
            {/* Logic list users bisa ditambah di sini dengan API /api/users */}
            <button onClick={async () => {
                const res = await fetch('/api/auth/users'); // Implement simple user fetch
                // Untuk demo, kita asumsikan user list ada
            }} className="text-blue-500 underline text-sm">Klik tab Profile untuk melihat info anda</button>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex flex-col items-center pb-4 border-b">
              <div className="w-24 h-24 bg-slate-200 rounded-full mb-4 overflow-hidden">
                {user.image && <img src={user.image} className="w-full h-full object-cover" />}
              </div>
              <p className="font-bold text-xl">{user.name}</p>
            </div>
            <div>
              <label className="text-sm text-slate-500">Ganti Nama</label>
              <input className="w-full p-2 border rounded-lg mt-1" defaultValue={user.name} />
            </div>
            <button className="w-full bg-slate-800 text-white p-3 rounded-xl">Save Changes</button>
          </div>
        )}
      </div>

      {/* Input Area (Only for Room & PM) */}
      {(tab === 'room' || (tab === 'pm' && selectedUser)) && (
        <form onSubmit={sendMessage} className="p-4 bg-white border-t border-slate-200">
          {image && <div className="mb-2 relative inline-block">
            <img src={image} className="h-20 w-20 object-cover rounded-lg border" />
            <button onClick={() => setImage('')} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1">X</button>
          </div>}
          <div className="flex items-center gap-2">
            <label className="cursor-pointer text-slate-400 hover:text-blue-600">
              <ImageIcon size={24} />
              <input type="file" hidden accept="image/*" onChange={handleImage} />
            </label>
            <input 
              className="flex-1 bg-slate-100 p-3 rounded-xl focus:outline-none focus:ring-2 ring-blue-500" 
              placeholder="Tulis pesan..."
              value={input}
              onChange={e => setInput(e.target.value)}
            />
            <button type="submit" className="bg-blue-600 text-white p-3 rounded-xl">
              <Send size={20} />
            </button>
          </div>
        </form>
      )}

      {/* Bottom Navigation */}
      <div className="flex bg-white border-t border-slate-200 pb-6 pt-2 px-4 justify-around text-slate-400">
        <button onClick={() => setTab('room')} className={`flex flex-col items-center ${tab === 'room' ? 'text-blue-600' : ''}`}>
          <MessageCircle size={24} />
          <span className="text-[10px] mt-1 font-medium">ROOM</span>
        </button>
        <button onClick={() => setTab('pm')} className={`flex flex-col items-center ${tab === 'pm' ? 'text-blue-600' : ''}`}>
          <Lock size={24} />
          <span className="text-[10px] mt-1 font-medium">PRIVATE</span>
        </button>
        <button onClick={() => setTab('profile')} className={`flex flex-col items-center ${tab === 'profile' ? 'text-blue-600' : ''}`}>
          <UserIcon size={24} />
          <span className="text-[10px] mt-1 font-medium">PROFILE</span>
        </button>
      </div>
    </div>
  );
}
