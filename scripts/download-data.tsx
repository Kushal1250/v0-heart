"use nodejs"

import fs from "fs"
import path from "path"
import axios from "axios"

async function downloadCSV() {
  console.log("Downloading heart disease dataset...")
  const url =
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/heart_disease_data-gcbBmwhbGDkcyqLAyqL7lpoRUCac53.csv"
  const filePath = path.join(process.cwd(), "public", "data", "heart_disease_data.csv")

  // Create directory if it doesn't exist
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  const writer = fs.createWriteStream(filePath)

  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  })

  response.data.pipe(writer)

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve)
    writer.on("error", reject)
  })
}

async function main() {
  try {
    await downloadCSV()
    console.log("CSV data downloaded successfully!")
  } catch (error) {
    console.error("Error downloading CSV data:", error)
  }
}

main()
