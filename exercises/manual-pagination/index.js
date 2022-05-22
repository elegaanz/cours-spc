import {useCallback, useMemo, useState} from "react";
import ReactDOM from "react-dom";
import './index.scss'

const rand = (max = 10000000) => Math.floor(Math.random() * max)
const hex = (bits = 32, x = rand(Math.pow(2, bits))) => '0x' + x.toString(16).padStart(Math.ceil(bits / 4), '0')
const bin = (bits = 32, x = rand(Math.pow(2, bits))) => x.toString(2).padStart(Math.ceil(bits), '0')

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

const register = (description, value = hex(), highlight = false) => ({ description, value, highlight });

const registers = {
    "LR": register("Link register"),
    "PC": register("Program counter"),
    "CR1": register("Control register 1"),
    "CR2": register("Control register 2"),
    "CR3": register("Control register 3 (adressage virtuel)", hex(32, PD_ADDR), true),
    "CR4": register("Control register 4"),
    "R0": register("Registre générique R0"),
    "R1": register("Registre générique R1"),
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
    if (str[0] === '1') flags.push('User')
    if (str[1] === '1') { flags.push('Write') } else { flags.push('Read-Only') }
    if (str[2] === '1') flags.push('Present')
    return flags.join(' | ')
}

const parseTable = (d) => {
    const data = d.split(/\s/).map(x => {
        return parseInt(x, 16)
    })
    if (data.length === 0) return []
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

function AddressInput(props) {
    const onChange = useCallback((e) => {
        let {value} = e.target
        if (value.startsWith('0x')) value = value.substring(2)
        const valueInt = parseInt(value, 16);
        if (props.onChange) props.onChange(valueInt)
    }, [props.onChange]);

    return (
        <input {...props} onChange={onChange}/>
    )
}

function ReaderBox({ mem }) {
    const [readerAddr, setReaderAddr] = useState(0)
    const [readerSize, setReaderSize] = parseDec(useState('1'))

    const memoryView = useMemo(() => [...Array(readerSize).keys()].map(x => hex(8, mem(readerAddr + x))).join(' '), [readerAddr, readerSize])

    const setReaderSizeBin = useCallback((e) => {
        setReaderSize(e.target.value);
    }, [])

    return (
        <div className="table">
            <h2>Lecteur de mémoire</h2>
            <p>Entre une adresse, un nombre d'octet et voit ce qu'il se cache dans la mémoire à cet endroit.</p>
            <label>
                Adresse (hexadécimal, avec ou sans <code>0x</code>)
                <AddressInput onChange={setReaderAddr} />
            </label>
            <label>
                Taille (en octets)
                <input type="number" min={0} defaultValue={1} onChange={setReaderSizeBin}></input>
            </label>
            <button onClick={() => navigator.clipboard.writeText(memoryView)}>Copier</button>
            <pre>{memoryView}</pre>
        </div>
    )
}

function DecoderBox() {
    const [tableData, setTableData] = useState('')
    const table = useMemo(() => parseTable(tableData), [tableData]);

    return (
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
                    <td>Numéro d'entrée (hex)</td>
                    <td>Adresse désignée</td>
                    <td>Drapeaux</td>
                </tr>
                </thead>
                <tbody>
                {table.map((x, i) => <tr key={i}>
                    <td>{hex(12, i)}</td>
                    <td>{hex(32, x.address)}</td>
                    <td>{x.flags}</td>
                </tr>)}
                </tbody>
            </table>
        </div>
    )
}

function AnswerBox() {
    const [answer, setAnswer] = useState('')
    const isCorrect = useMemo(() => {
        if (answer.startsWith('0x')) {
            if (parseInt(answer.substring(2), 16) === magicNumber) return true;
        } else {
            if (answer === magicNumber.toString()) return true;
        }

        if (answer === PG[0].toString()) return 'partially';
        else return false;
    }, [answer, magicNumber, PG[0]]);

    return (
        <>
            <label className="monospace" htmlFor="answer">*addr == </label>
            <input id="answer" placeholder="142" onChange={(e) => setAnswer(e.target.value)}></input>
            {(isCorrect === true) ? <p>✅ Bonne réponse !</p> : null}
            {(isCorrect === 'partially') ? <p>Tu as réussi à trouver la page, mais tu es au début, n'oublie pas d'ajouter la dernière partie de l'adresse</p> : null}
            {(!answer) ? <p>Entrez une réponse ci-dessus</p> : null}
            {(isCorrect === false && !!answer) ? <p>❎ La réponse n'est pas valide</p> : null}
        </>
    )
}

export function App() {
    return <div className="exo">
        <header>
            <h1>Exercice: Décodage d'adresse virtuelle</h1>
        </header>
        <main>
            <div className="table inset">
                <h2>Registres</h2>
                <table>
                    <tbody>
                    {Object.entries(registers).map(([name, { description, value, highlight }]) =>
                        <tr key={name} className={highlight ? 'hl' : ''}>
                            <td><abbr title={description}>{name}</abbr></td>
                            <td>{value}</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
            <ReaderBox mem={mem} />
            <DecoderBox />
        </main >
        <footer>
            <p>Un processus a été mis en pause alors qu'il essayait d'accéder à l'adresse ci-contre, pour y lire un octet. L'exercice consiste à faire le travail du processeur: décoder l'adresse virtuelle pour retrouver l'adresse physique correspondante, et y trouver la valeur de l'octet auquel le processus essaye d'accéder.</p>
            <div>
                <code>
                    char* addr = 0b
                    <span className="orange">{bin(10, pdIdx)}</span>
                    <span className="blue"  >{bin(10, ptIdx)}</span>
                    <span className="green">{bin(12, pgIdx)}</span>;
                    <br />
                    // &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <span className="orange">pd={hex(10, pdIdx)}</span>&nbsp;&nbsp;
                    <span className="blue"  >pt={hex(10, ptIdx)}</span>&nbsp;&nbsp;
                    <span className="green" >pg={hex(12, pgIdx)}</span>
                </code>
                <AnswerBox />
            </div>
        </footer>
    </div >
}

const app = document.getElementById("app");
ReactDOM.render(<App />, app);