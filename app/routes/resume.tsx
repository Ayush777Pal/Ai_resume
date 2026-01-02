import React, { useEffect,useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import Ats from '~/components/Ats';
import Details from '~/components/Details';
import Summary from '~/components/Summary';
import { usePuterStore } from '~/lib/puter';

export const meta = ()=>([
    { title: 'Resumite | Review '},
    { name: 'description', content:'Detailed overview of your resume'},
])

const Resume = () => {
    const {id} = useParams();
    const {auth, isLoading, fs, kv}= usePuterStore();
    const [imageUrl, setImageUrl] = useState('');
    const [resumeUrl, setResumeUrl] = useState('');
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const navigate = useNavigate();
    useEffect(() => {
          if(!isLoading && !auth.isAuthenticated){
              navigate(`/auth?next=/resume/${id}`);
          }
      }, [auth.isAuthenticated])
    useEffect(()=>{
        const loadResume=async()=>{
            const resume = await kv.get(`resume:${id}`);
            if(!resume) return;
            const data = JSON.parse(resume);
            //files from puter cloud storage return as blobs
            //image file is return as image blobs same as for pdf files
            const resumeBlob = await fs.read(data.resumePath);
            if(!resumeBlob) return;
            const pdfBlob = new Blob([resumeBlob], {type:'application/pdf'});
            const resumeUrl= URL.createObjectURL(pdfBlob);
            setResumeUrl(resumeUrl);
            //same for image blob
            const imageBlob = await fs.read(data.imagePath);
            if(!imageBlob) return;
            const imageUrl= URL.createObjectURL(imageBlob);
            setImageUrl(imageUrl);

            setFeedback(data.feedback);
            console.log({resumeUrl, imageUrl, feedback:data.feedback})
        }
        loadResume();
    },[id]);
  return (
    <main className='pt-0!'>
        {/* for back button */}
        <nav className='resume-nav'>
            <Link to="/" className='back-button'>
            <img src='/icons/back.svg' alt-='logo' className='w-2.5 h-2.5'/>
            <span className='text-gray-800 text-sm font-semibold'>Back to HomePage</span>
            </Link>
        </nav>
        <div className='flex flex-row w-full max-lg:flex-col-reverse'>
            <section className="feedback-section bg-[url('/images/bgsmall.svg') bg-cover h-screen sticky top-0 items-center justify-center]">
                {imageUrl && resumeUrl && (
                    <div className='animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] max-wxl:h-fit w-fit'>
                        <a href={resumeUrl} target='_blank' rel='noopener noreferrer'>
                            <img src={imageUrl}
                            className='w-full h-full object-contain rounded-2xl'
                            title='resume'/>
                        </a>
                    </div>
                )}
            </section>
            <section className='feedback-section'>
                <h2 className='text-4xl text-black! font-bold'>
                    Resume Review
                </h2>
                {feedback ? (
                    <div className='flex flex-col gap-8 animate-in fade-in duration-1000'>
                        <Summary feedback={feedback}></Summary>               
                        <Ats score={feedback.ATS.score || 0} suggestions={feedback.ATS.tips}/>
                        <Details feedback={feedback}/>         
                    </div>
                ):(
                    <img src='/images/resume-scan-2.gif' className='w-full'/>
                )}
            </section>
        </div>
    </main>
  )
}

export default Resume