import {prepareInstructions,AIResponseFormat} from "../../constants";
import React, { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router';
import FileUploader from '~/components/FileUploader';
import Navbar from "~/components/Navbar";
import { convertPdfToImage } from '~/components/pdf2img';
import { usePuterStore } from '~/lib/puter';
import { generateUUID } from '~/lib/utils';


const Upload = () => {
    const {auth, isLoading, fs, ai, kv} = usePuterStore();//fs stands for file storage
    const navigate= useNavigate();
    const [isProcessing, setisProcessing] = useState(false);
    const [statusText, setstatusText] = useState('');
    const [file, setFile] = useState<File|null>(null);

    const handleFileSelect=(file:File|null)=>{
        setFile(file);
    }

    const handleAnalyze=async({companyName, jobTitle, jobDescription, file}:{companyName:string, jobTitle:string, jobDescription:string, file:File})=>{
        setisProcessing(true);
        setstatusText('Uploading the file....');
        const uploadedFile=await fs.upload([file]);
        if(!uploadedFile) return setstatusText("error:Failed to upload file");

        setstatusText("converting to image....");
        const imageFile = await convertPdfToImage(file);
        if(!imageFile.file)return setstatusText("error:failed to convert pdf to image");

        setstatusText('Uploading the image...');
        const uploadedImage = await fs.upload([imageFile.file]);
        if(!uploadedImage) return setstatusText('Error:failed to upload image');
        setstatusText('preparing data...');
        const uuid=generateUUID();
        const data={
            id:uuid,
            resumePath:uploadedFile.path,
            imagePath:uploadedImage.path,
            companyName,jobTitle,jobDescription,
            feedback:''
        }
        //kv stand for key value
        await kv.set(`resume:${uuid}`,JSON.stringify(data));
        setstatusText('Analyzing...');

    const feedback = await ai.feedback(
            uploadedFile.path,
            prepareInstructions({jobTitle, jobDescription,AIResponseFormat})
        )
        if (!feedback) return setstatusText('Error: Failed to analyze resume');

        const feedbackText = typeof feedback.message.content === 'string'
            ? feedback.message.content
            : feedback.message.content[0].text;

        data.feedback = JSON.parse(feedbackText);
        await kv.set(`resume:${uuid}`, JSON.stringify(data));
        setstatusText('Analysis complete, redirecting...');
        console.log(data);
        navigate(`/resume/${uuid}`);
    }
    const handleSubmit=(e:FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        const form = e.currentTarget.closest('form');
        if(!form) return;
        const formdata=new FormData(form);
        const companyName=formdata.get('company-name')as string;//writing as string becuase it will give error while passing
        const jobTitle=formdata.get('job-title')as string;
        const jobDescription=formdata.get('job-description')as string;
        console.log({
            companyName, jobTitle, jobDescription, file
        })
        if(!file) return;
        handleAnalyze({companyName, jobTitle, jobDescription, file})
    }
  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
       <Navbar></Navbar>
       <section className='main-section'>
        <div className='page-heading'>
            <h1>Smart Feedback for your dream job</h1>
            {isProcessing?(
                <>
                <h2>{statusText}</h2>
                <img src="/images/resume-scan.gif" className='w-full'></img>
                </>
            ):<h2>
                Drop your resume for an ATS score and improvement tips
            </h2>
            }
            {!isProcessing && (
                <form id='upload-form' onSubmit={handleSubmit} className='flex flex-col gap-4 mt-8'>
                    <div className='form-div'>
                        <label htmlFor='company-name'>Company Name</label>
                        <input type='text' name='company-name' placeholder="Company Name" id="company-name"/>
                    </div>
                    <div className='form-div'>
                        <label htmlFor='job-title'>Job Title</label>
                        <input type='text' name='job-title' placeholder="Job Title" id="job-title"/>
                    </div>
                    <div className='form-div'>
                        <label htmlFor='job-description'>Job Description</label>
                        <textarea rows={5} name='job-description' placeholder="Job Description" id="job-description"/>
                    </div>
                    <div className='form-div'>
                        <label htmlFor='uploader'>Upload Resume</label>
                        <FileUploader onFileSelect={handleFileSelect}/>
                    </div>
                    <button className='primary-button' type="submit">
                        Anaylze Resume
                    </button>
                </form>
            )}
        </div>
       </section>
    </main>
  )
}

export default Upload