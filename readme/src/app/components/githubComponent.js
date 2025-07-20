'use client'

import { useEffect, useState } from "react"
import { Octokit } from "@octokit/core"
import {Input} from "@heroui/input";

export default function GitHubFile() {
  const [requirement, setRequirement] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [owner, setOwner] = useState('')
  const [repo, setRepo] = useState('')
  const [packagejson, setPackagejson] = useState('')
  const [licenza, setLicenza] = useState('')
  const [messaggio, setMessaggio] = useState('')

  async function fetchRequirements() {
    setLoading(true)
    setError(null)
  
    try {
      const octokit = new Octokit()
  
      const response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner,
        repo,
        path: 'server/requirements.txt',
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      })
  
      const content = atob(response.data.content)
      setRequirement(content)
    } catch (e) {
      setError(`Errore nel fetch di requirements.txt: ${e.message}`)
      setRequirement('')
    } finally {
      setLoading(false)
    }
  }
  

  async function fetchPackagejson() {
    setLoading(true)
    setError(null)
  
    try {
      const octokit = new Octokit()
  
      const response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner,
        repo,
        path: 'package.json',
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      })
  
      const content = atob(response.data.content)
      setPackagejson(content)
    } catch (e) {
      setError(`Errore nel fetch di package.json: ${e.message}`)
      setPackagejson('')
    } finally {
      setLoading(false)
    }
  }
  

  async function fetchReadme() {
    try {
      const res = await fetch('http://localhost:8000/readme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_name: `${owner}/${repo}`,
          requirements: requirement,
          packagejson: packagejson,
          licenza: licenza
        })
      })
      const data = await res.json()
      setMessaggio(data.readme)
    } catch (error) {
      setError(`Errore nel fetch del README: ${error.message}`)
    }
  }
  
  
  
  async function handleFetch() {
    await fetchRequirements();
    await fetchPackagejson();
    await new Promise((resolve) => setTimeout(resolve, 200)); 
    await fetchReadme();
  }
  
function downloadReadme() {
  if (!messaggio) return;

  const blob = new Blob([messaggio], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'README.txt'; 
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}


  return (
    <>
    <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div>
            <h1 className="text-lg font-bold">Utente</h1>
            <Input
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            className="max-w-xs border border-black rounded"
            placeholder="Xx_marcorossi_xX"
            type="text"
            />
        </div>
        <div>
            <h1 className="text-lg font-bold">Repository</h1>
            <Input
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
            className="max-w-xs border border-black rounded"
            placeholder="Vercel"
            type="text"
            />
        </div>
        <div>
            <h1 className="text-lg font-bold">Licenza (opzionale)</h1>
            <Input
            value={licenza}
            onChange={(e) => setLicenza(e.target.value)}
            className="max-w-xs border border-black rounded"
            placeholder="MIT"
            type="text"
            />
        </div>
        <button
            onClick={handleFetch}
            className="mt-4 px-4 py-2 bg-black text-white rounded">
            Crea Readme
        </button>
        <button
  onClick={downloadReadme}
  disabled={!messaggio}
  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
>
  Scarica README
</button>

    </div>
    </>
  )
}
