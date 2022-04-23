import { useState } from "react";
import ReactDOM from "react-dom";
import './index.scss'

const rand = (max = 10000000) => Math.floor(Math.random() * max)
const hex = x => '0x' + (x === undefined ? rand() : x).toString(16)

// FLAGS : Reserved-Reserved-User-Write-Present
const randomFlags = () => rand(7)

const makeEntry = addr => {
    const a = addr || rand()
    return {
        address: a * 16, // shift by 5 bits for flags
        flags: randomFlags(),
    }
}
const pdeToBin = pde => {
    let num = pde.address + pde.flags
    let bin = [0, 0, 0, 0];

    for (let index = bin.length - 1; index >= 0; index--) {
        let byte = num & 0xff;
        bin[index] = byte;
        num = (num - byte) / 256;
    }

    return bin;
}

const magicNumber = rand(255)

const pgIdx = 0xb01
let pg = [...Array(4096).keys()].map(x => rand(magicNumber - 1))
pg[pgIdx] = magicNumber
const PG_ADDR = (200 + rand(100)) * 4096
const PG = pg

const ptIdx = 0x0a0
let pt = [...Array(4096).keys()].map(x => makeEntry(rand()))
const PT_ADDR = (100 + rand(100)) * 4096
pt[ptIdx] = { address: PG_ADDR, flags: 3 }
const PT = pt.flatMap(pdeToBin)


const pdIdx = 0x015
let pd = [...Array(4096).keys()].map(x => makeEntry(rand()))
pd[pdIdx] = { address: PT_ADDR, flags: 3 }
const PD_ADDR = rand(100) * 4096
const PD = pd.flatMap(pdeToBin)

const mem = addr => {
    // PD
    if (addr >= PD_ADDR && addr < PD_ADDR + PD.length) {
        return PD[addr - PD_ADDR]
    }
    if (addr >= PT_ADDR && addr < PT_ADDR + PT.length) {
        return PT[addr - PT_ADDR]
    }
    if (addr >= PG_ADDR && addr < PG_ADDR + PG.length) {
        return PG[addr - PG_ADDR]
    }
    return 0
}

const registers = {
    "LR": hex(),
    "PC": hex(),
    "CR1": hex(),
    "CR2": hex(),
    "CR3": hex(PD_ADDR),
    "CR4": hex(),
    "R0": hex(),
    "R1": hex(),
}

const parseHex = ([getter, setter]) => {
    let num = 0
    if (getter.startsWith('0x')) {
        num = Number.parseInt(getter.substr(2), 16)
    } else {
        num = Number.parseInt(getter, 16)
    }
    if (Number.isNaN(num)) {
        num = 0
    }
    return [num, setter]
}

const parseDec = ([getter, setter]) => {
    let num = Number.parseInt(getter)
    if (Number.isNaN(num)) {
        num = 0
    }
    return [num, setter]
}

const decodeFlags = f => {
    let flags = []
    let str = "000" + f.toString(2)
    str = str.substr(str.length - 3)
    if (str[0] == '1') flags.push('User')
    if (str[1] == '1') { flags.push('Write') } else { flags.push('Read-Only') }
    if (str[2] == '1') flags.push('Present')
    return flags.join(' | ')
}

const parseTable = (d) => {
    const data = d.split(' ').map(x => {
        return Number.parseInt(x)
    })
    if (data.length == 0) return []
    let table = []
    for (let i = 0; i < data.length / 4; i++) {
        const bytes = data.slice(i * 4, i * 4 + 4)
        table.push({
            address: bytes[0] * 16777216 + bytes[1] * 65536 + bytes[2] * 256 + bytes[3] & ~0b11111,
            flags: decodeFlags(bytes[3] & 0b11111)
        })
    }
    return table
}

export function App() {
    const [readerAddr, setReaderAddr] = parseHex(useState('0'))
    const [readerSize, setReaderSize] = parseDec(useState('0'))
    const [tableData, setTableData] = useState('')
    const [answer, setAnswer] = useState('')
    const table = parseTable(tableData)
    const memoryView = [...Array(readerSize).keys()].map(x => mem(readerAddr + x)).join(' ')
    return <div className="exo">
        <header>
            <h1>Décodage de l'adresse : <code>
                0x
                <span className="orange">{pdIdx.toString(16)}</span>
                <span className="blue"  >{ptIdx.toString(16)}</span>
                <span className="green" >{pgIdx.toString(16)}</span>
            </code></h1>
        </header>
        <main>
            <div className="table">
                <h2>Registres</h2>
                <table>
                    <tbody>
                        {Object.keys(registers).map(r =>
                            <tr key={r}>
                                <td>{r}</td>
                                <td>{registers[r]}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="table">
                <h2>Lecteur de mémoire</h2>
                <p>Entre une adresse, un nombre d'octet et voit ce qu'il se cache dans la mémoire à cet endroit.</p>
                <p>Attention, les adresses doivent être entrées en héxadécimal (avec ou sans le préfixe 0x)</p>
                <label>Adresse<input onChange={(e) => setReaderAddr(e.target.value)}></input></label>
                <label>Taille (en octets)<input onChange={(e) => setReaderSize(e.target.value)}></input></label>
                <button onClick={() => navigator.clipboard.writeText(memoryView)}>Copier</button>
                <pre>{memoryView}</pre>
            </div>
            <div className="table">
                <h2>Décodeur de mémoire</h2>
                <p>Parce que lire la mémoire à la main c'est pas pratique, cet outil permet
                    de lire ce que tu viens de copier comme si c'était une Page Directory,
                    une Page Table ou une Page.
                </p>
                <p>Attention : si tu colles des données qui ne sont pas valides, aucun avertissement ne
                    sera affiché, mais ton tableau n'aura que des valeurs fausses.
                </p>
                <p>Recopie le contenu de la mémoire ici pour voir ce qu'il signifie :</p>
                <textarea onChange={e => setTableData(e.target.value)}></textarea>
                <table>
                    <thead>
                        <tr>
                            <td>Numéro d'entrée (héxadécimal)</td>
                            <td>Adresse désignée</td>
                            <td>Drapeaux</td>
                        </tr>
                    </thead>
                    <tbody>
                        {table.map((x, i) => <tr>
                            <td>{hex(i)}</td>
                            <td>{hex(x.address)}</td>
                            <td>{x.flags}</td>
                        </tr>)}
                    </tbody>
                </table>
            </div>
            <div className="table">
                <h2>Réponse</h2>
                <label>Si tu penses avoir trouvé l'octet stocké à cette adresse, recopie le ici pour vérifier :
                    <input onChange={(e) => setAnswer(e.target.value)}></input></label>
                {answer === magicNumber.toString() ? <p>✅ Bonne réponse !</p> : null}
                {answer === PG[0].toString() ? <p>Tu as réussi à trouver la page, mais tu es au début, n'oublie pas d'ajouter la dernière partie de l'adresse</p> : null}
            </div>
        </main >
    </div >;
}

const app = document.getElementById("app");
ReactDOM.render(<App />, app);