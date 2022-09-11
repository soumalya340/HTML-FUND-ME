import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")

connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw

console.log(ethers)
async function connect() {
    if (typeof window.ethereum !== "undefined") {
        console.log("I see metamask")
        await window.ethereum.request({ method: "eth_requestAccounts" })
        connectButton.innerHTML = "Connected"
        console.log("Connected!!")
    } else {
        console.log("I don't see metamask")
        connectButton.innerHTML = "No Connect Button"
    }
}

async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const balance = await provider.getBalance(contractAddress)
        console.log(ethers.utils.formatEther(balance))
        //formatEther is used to format the amount or make easier to read
    }
}

async function fund() {
    const ethAmount = document.getElementById("ethAmount").value
    try {
        console.log(`Funding with : ${ethAmount}......`)
        if (typeof window.ethereum !== "undefined") {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const signer = provider.getSigner() //returns which ever wallet connected to  the site
            console.log(signer)
            const contract = new ethers.Contract(contractAddress, abi, signer)
            console.log("Hi")
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })

            //listen for the transaction(tx) to be mined
            //listen for an events
            await listenForTransactionMine(transactionResponse, provider)
            console.log("Funded!!")
        }
    } catch (error) {
        console.log(error)
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}......`)
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReciept) => {
            console.log(
                `Mined with ${transactionReciept.confirmations} confirmation`
            )
        })
        resolve()
    })
}

async function withdraw() {
    console.log("Withdrawing...")
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.withdraw()
            await listenForTransactionMine(transactionResponse, provider) //
        } catch (error) {
            console.log(error)
        }
    }
}
