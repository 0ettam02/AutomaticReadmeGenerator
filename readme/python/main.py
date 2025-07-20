from fastapi import FastAPI, Request
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from google import genai
from google.genai import types


load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ReadmeRequest(BaseModel):
    project_name: str
    requirements: str
    packagejson: str
    licenza: str

@app.post("/readme")
async def readme(request: ReadmeRequest):
    messaggio = generate_readme(
        request.project_name,
        request.requirements,
        request.packagejson,
        request.licenza
    )
    return {"readme": messaggio}

# -----------------------------------------------------------------------------
def generate_readme(project_name, requirements, packagejson, licenza):
    client = genai.Client(
        api_key=os.environ.get("GEMINI_API_KEY"),
    )
    model = "gemini-2.5-flash"

    prompt = f"""
Sei un assistente esperto nella scrittura di README per progetti software. Ti fornirò alcune informazioni chiave riguardo un progetto, come nome, descrizione, obiettivi, funzionalità, dataset, istruzioni di installazione, licenza e contatti.

IMPORTANTE:
- Non iniziare dicendo che sei un AI o cose tipo "Ecco il README".
- Dai direttamente il contenuto.
- Scrivi nella lingua coerente con quella del progetto (italiano se è italiano, inglese se in inglese, ecc.)

Il tuo compito è creare un README ben strutturato, chiaro e professionale, seguendo questa struttura di base:

# [Nome Progetto con emoji (CI TENGO AL FATTO CHE CI SIA UN EMOJI CARINA COERENTE COL PROGETTO)]

[Descrizione sintetica del progetto, obiettivi e ambito di utilizzo.]

## 📌 Introduzione  
[Spiegazione più dettagliata del progetto e del problema che risolve.]

## 🧑‍💻 Funzionalità  
[Elenco puntato delle principali funzionalità.]

## 📊 Dataset  
[Descrizione del dataset, se presente.]

## 🛠️ Installazione  
[Istruzioni passo-passo per configurazione e avvio.]

## 📜 Licenza  
[Tipo di licenza e note rilevanti.]

## 📫 Contatti  
[Email, GitHub o altri riferimenti del team.]

---

🧠 Regole per rendere ogni README unico e interattivo:
- Varia l’ordine delle sezioni (tranne titolo e introduzione).
- Usa stili narrativi diversi a seconda del progetto: descrittivo, tecnico, ispirazionale o sintetico.
- Inserisci elementi dinamici come:
  - Link interni (`[Vai a Funzionalità](#funzionalità)`)
  - Blocchi `<details>` per esempi o dettagli tecnici
  - Badge dinamici da shields.io
  - Tabelle, callout emoji (⚠️, 💡)
  - GIF o immagini illustrative se il progetto lo consente
- Se presenti, sfrutta `requirements.txt`, `package.json`, `Dockerfile`, ecc. per arricchire sezioni tecniche.
- Aggiungi eventualmente sezioni extra come:
  - ✨ Esempi d'Uso
  - 🧪 Come contribuire
  - 📎 Link utili
  - 💬 FAQ

Se qualche informazione non è disponibile, omettila senza avvisi.

Ora, usa le informazioni che ti do di seguito per generare il README in questo formato, ma con un testo completamente nuovo, unico e coerente con il contesto fornito.

Informazioni:

Nome Progetto: {project_name}

Requirements.txt: {requirements}

package.json: {packagejson}

Licenza: {licenza}

"""

    contents = [
        types.Content(role="user", parts=[types.Part.from_text(text=prompt)])
    ]

    risposta = ""
    for chunk in client.models.generate_content_stream(model=model, contents=contents):
        risposta += chunk.text or ""
    return risposta.strip()