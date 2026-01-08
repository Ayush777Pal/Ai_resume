import React from 'react'
import { Link } from 'react-router'
import ScoreCard from './ScoreCard'
import { useEffect, useState } from "react";
import { usePuterStore } from '~/lib/puter'


const ResumeCard = ({resume:{id, companyName, jobTitle, feedback, imagePath}}:{resume:Resume}) => {
      const{auth,fs}= usePuterStore();
     const [resumeUrl, setresumeUrl] = useState('');
  useEffect(()=>{
    const loadResume=async()=>{
      const blob= await fs.read(imagePath);
      if(!blob) return;
      let url=URL.createObjectURL(blob);
      setresumeUrl(url);
    }
    loadResume();
  },[imagePath]);
  return (
    <Link to={`/resume/${id}`} className='resume-card animate-in fade-in duration-1000'>
        <div className='resume-card-header'>
            <div className='flex flex-col gap-2'>
            {companyName && <h2 className='text-black! font-bold wrap-break-word'>{companyName}</h2>}
            {jobTitle && <h3 className='text-lg wrap-break-word text-gray-500'>{jobTitle}</h3>}
            {!companyName && !jobTitle && <h2 className='text-black! font-bold'>Resume</h2>}
            </div>
            <div className='shrink-0'>
                <ScoreCard score={feedback.overallScore}></ScoreCard>
            </div>
        </div>
        {resumeUrl && <div className='gradient-border animate-in fade-in duration-1000'>
            <div className='w-full h-full'>
                <img src={resumeUrl}
                alt='resume'
                className='w-full h-87.5 max-sm:h-50 object-cover object-top'/>
            </div>
        </div>}
    </Link>
  )
}

export default ResumeCard