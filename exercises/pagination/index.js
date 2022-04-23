import { useState } from "react";
import ReactDOM from "react-dom";
import './index.scss'

const steps = [
    'on lit le registre CR3 pour obtenir l\'adresse de la Page Directory',
    'on va voir ce qu\'il y a dans la mémoire à cet adresse : c\'est la Page Directory',
    'la partie rouge de l\adresse vaut 0x15 : on prend la 0x15ème entrée',
]

const hex = () => '0x' + Math.floor(Math.random() * 10000000).toString(16)

const cr3 = "0x1000";
const registers = {
    "LR": hex(),
    "PC": hex(),
    "CR1": hex(),
    "CR2": hex(),
    "CR3": cr3,
    "CR4": hex(),
    "R0": hex(),
    "R1": hex(),
}

export function App({ showSteps = false }) {
    let [step, setStep] = useState(0)
    return <div className="exo">
        <header>
            <h1>Décodage de l'adresse : <code>
                0x
                <span class="orange">000000000015</span>
                <span class="blue"  >1000500000a0</span>
                <span class="green" >000200000b01</span>
            </code></h1>
            {showSteps ? <p className="step">Étape {step + 1} : {steps[step]}</p> : null}
            {step > 0 ? <button onClick={() => setStep(step - 1)}>Précédent</button> : null}
            {step < steps.length - 1 ? <button onClick={() => setStep(step + 1)}>Suivant</button> : null}
        </header>
        <main>
            <div class="table">
                <h2>Registres</h2>
                <table>
                    {Object.keys(registers).map(r =>
                        <tr className={r == 'CR3' ? 'hl' : ''}>
                            <td>{r}</td>
                            <td>{registers[r]}</td>
                        </tr>
                    )}
                </table>
            </div>
            {step > 0 ?
                <div class="table">
                    <h2>Page Directory (adresse : <code>{cr3}</code>)</h2>
                    <table>
                        <thead>
                            <td>Numéro d'entrée (héxadécimal)</td>
                            <td>Adresse désignée</td>
                            <td>Drapeaux</td>
                        </thead>
                        <tbody>
                            {[...Array(4).keys()].map(x => {
                                const num = '0x' + x.toString(16)
                                return <tr key={x}>
                                    <td>{num}</td>
                                    <td>{hex()}</td>
                                    <td>{x < 2 ? 'Aucun' : 'Present | Read | Write'}</td>
                                </tr>
                            })}
                            <tr>
                                <td>…</td>
                                <td>…</td>
                                <td>…</td>
                            </tr>
                            {[...Array(5).keys()].map(x => {
                                const num = '0x' + (x + 20).toString(16)
                                return <tr key={x + 20} className={step == 2 && x == 1 ? 'hl' : ''}>
                                    <td>{num}</td>
                                    <td>{x == 1 ? '0x5400' : hex()}</td>
                                    <td>Present | Read | Write</td>
                                </tr>
                            })}
                        </tbody>
                    </table>
                </div> : null}
        </main>
    </div >;
}

const app = document.getElementById("app");
ReactDOM.render(<App showSteps={true} />, app);