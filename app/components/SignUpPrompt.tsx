import React from 'react';
import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { supabase } from '../lib/supabase';

export default function SignUpPrompt() {
  const { register: signup, handleSubmit, formState: { errors } } = useForm<FormData>();
   const [status, setStatus] = useState<string>('');
   const onSubmit: SubmitHandler<FormData> = async (data) => {
       if(data!=undefined) {
            const email: string|undefined = data.get("email")?.toString();
            const password: string|undefined = data.get("password")?.toString();
            const confirmpassword: string|undefined = data.get("confirmpassword")?.toString();
            setStatus("Signing up...");
            if(password === confirmpassword) {
                const signup = await supabase.auth.signUp({
                    email: email,
                    password: password
                });
                if(signup.error) {
                    setStatus("Signup had an error!: " + signup.error.message);
                }
                else {
                    setStatus("Signup was successful!");
                }
            }
       }
   };
 
   return (
     <div className="rounded-lg bg-slate-400 flex-col">
         <form onSubmit={handleSubmit(onSubmit)}>
             <input
                {...signup("email", { required: "Email is required" })} type="text" placeholder="Username" className="input-md input-bordered w-full text-slate-300">
             </input>
             {errors.email && <p className="text-red-500">{errors.email.message}</p>}
             <input {...signup("password", { required: "Password is required" })} type="password" placeholder="Password" className="input-md input-bordered w-full text-slate-300">
             </input>
             {errors.password && <p className="text-red-500">{errors.password.message}</p>}
             <input {...signup("confirmpassword", { required: "Confirm password is required" })} type="password" placeholder="Confirm Password" className="input-md input-bordered w-full text-slate-300">
             </input>
             {errors.confirmpassword && <p className="text-red-500">{errors.confirmpassword.message}</p>}
             <button type="submit" className="btn btn-primary w-full">
               Sign Up
             </button>
         </form>
         <h5>Signup Status: {status || ""}</h5>
     </div>
   )
}
