import AppKit
import Foundation
import Vision

guard CommandLine.arguments.count >= 2 else {
  FileHandle.standardError.write(Data("Usage: swift scripts/ocr-image.swift <image-path>\n".utf8))
  exit(1)
}

let imageURL = URL(fileURLWithPath: CommandLine.arguments[1])

guard let image = NSImage(contentsOf: imageURL) else {
  FileHandle.standardError.write(Data("Unable to read image at \(imageURL.path)\n".utf8))
  exit(1)
}

var proposedRect = CGRect(origin: .zero, size: image.size)
guard let cgImage = image.cgImage(forProposedRect: &proposedRect, context: nil, hints: nil) else {
  FileHandle.standardError.write(Data("Unable to decode CGImage for \(imageURL.path)\n".utf8))
  exit(1)
}

let request = VNRecognizeTextRequest()
request.recognitionLevel = .accurate
request.usesLanguageCorrection = true
request.recognitionLanguages = ["zh-Hans", "en-US"]

do {
  let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
  try handler.perform([request])

  let text = (request.results ?? [])
    .compactMap { $0.topCandidates(1).first?.string }
    .joined(separator: "\n")

  FileHandle.standardOutput.write(Data(text.utf8))
} catch {
  FileHandle.standardError.write(Data("OCR failed: \(error.localizedDescription)\n".utf8))
  exit(1)
}
