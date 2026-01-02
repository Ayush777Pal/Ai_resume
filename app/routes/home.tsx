import type { Route } from "./+types/home";
import { useEffect, useState } from "react";
import Navbar from "~/components/Navbar";
// import {resumes} from "../../constants";
import ResumeCard from "~/components/ResumeCard";
import { usePuterStore } from '~/lib/puter';
import { useNavigate } from 'react-router';
import { Link } from "react-router";


export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumite" },
    { name: "description", content: "Smart feedback for your dream job" },
  ];
}

export default function Home() {
  const{auth,kv}= usePuterStore();
      const navigate=useNavigate();
      useEffect(() => {
          if(!auth.isAuthenticated){
              navigate("/auth?next=/");
          }
      }, [auth.isAuthenticated])
      //resume of type array
    const [resumes, setResume] = useState<Resume[]>([]);
    const [loadingResume, setLoadingResume] = useState(false);
    useEffect(()=>{
      const loadresume= async()=>{
        setLoadingResume(true);
        const resumes = (await kv.list('resume:*', true)) as KVItem[];
        const parseResumes=resumes?.map((resume)=>(
          JSON.parse(resume.value)as Resume
        ))
        console.log(parseResumes);
        setResume(parseResumes || []);
        setLoadingResume(false);
      }
      loadresume();
    },[])
 
  return <main className="bg-[url('/images/bg-main.svg')] bg-cover">
    <Navbar></Navbar>
    <section className="main-section">
      <div className="page-heading py-16">
        <h1>Track Your Applications & Resume Ratings</h1>
        {!loadingResume && resumes?.length==0?(
            <h2>No resume found. Upload your first reusme to get feedback</h2>
        ):(
            <h2>Review your submissions and check AI-powered feedback.</h2>
        )}
      </div>
      {loadingResume && (
        <div className="flex flex-col items-center justify-center">
          <img src="/images/resume-scan-2.gif" className="w-50"></img>
        </div>
      )}
      {!loadingResume && resumes.length>0 && (
      <div className="resumes-section">
        {resumes.map((resume)=>(
        <ResumeCard key={resume.id} resume={resume}></ResumeCard>
         ))}
      </div>
    )}
    {!loadingResume && resumes?.length==0 && (
      <div className="flex flex-col items-center justify-center mt-10 gap-4">
        <Link to='/upload' className="primary-button w-fit text-xl font-semibold">
        Upload Resume
        </Link>
      </div>
    )}
    </section>
  </main>;
}
