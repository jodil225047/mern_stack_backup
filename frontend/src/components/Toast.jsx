import { createContext, useContext, useState } from 'react';
const ToastContext=createContext({success:()=>{},error:()=>{},info:()=>{}});
export function ToastProvider({children}){const [toasts,setToasts]=useState([]);const push=(type,message)=>{const id=Date.now()+Math.random();setToasts(t=>[...t,{id,type,message}]);setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),3600);};return <ToastContext.Provider value={{success:m=>push('success',m),error:m=>push('error',m),info:m=>push('info',m)}}>{children}<div className="toast-stack" aria-live="polite">{toasts.map(t=><div key={t.id} className={`toast toast-${t.type}`}>{t.message}</div>)}</div></ToastContext.Provider>;}
export const useToast=()=>useContext(ToastContext);
