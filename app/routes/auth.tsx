import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { usePuterStore } from '~/lib/puter'
export const meta = () =>([
    //look at the browser tab
    {title:'Resumite | Auth'},
    {name:'description', content: 'Log into your account'},
])

const auth = () => {
    //check line 420 in puter.ts
  const{isLoading,auth}= usePuterStore();
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const next = params.get("next"); // null ho sakta hai

  useEffect(() => {
    if (isLoading) return;
    if (auth.isAuthenticated && next) {
      navigate(next, { replace: true });
    }
  }, [auth.isAuthenticated, isLoading, next, navigate]);
  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen flex items-center justify-center">
        <div className='gradient-border shadow-lg'>
            <section className='flex flex-col gap-8 bg-white rounded-2xl p-10'>
                <div className='flex flex-col items-center gap-2 text-center'>
                    <h1>Welcome</h1>
                    <h2>Log in to continue your job journey</h2>
                </div>
                <div>
                    {isLoading?(
                        <button className='auth-button animate-pulse'>
                            <p>Signing you in....</p>
                        </button>
                    ):(
                        <>
                        {auth.isAuthenticated?(
                            <button className='auth-button' onClick={auth.signOut}>
                                Log out
                            </button>
                        ):(
                            <button className='auth-button' onClick={auth.signIn}>
                                Log in
                            </button>
                        )}
                        </>
                    )}
                </div>
            </section>
        </div>
    </main>
  )
}

export default auth