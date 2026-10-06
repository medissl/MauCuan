import ExpoModulesCore
import Vision
import UIKit
import ImageIO

public class ExpoTextExtractorModule: Module {
    public func definition() -> ModuleDefinition {
        Name("ExpoTextExtractor")

        Constants([
            "isSupported": true
        ])

        AsyncFunction("extractReceiptLayout") { (url: URL, promise: Promise) in
            do {
                let data = try Data(contentsOf: url)
                guard let image = UIImage(data: data), let cgImage = image.cgImage else {
                    throw Exception(name: "OCR_ERROR", description: "Image unavailable")
                }
                let orientation: CGImagePropertyOrientation
                switch image.imageOrientation {
                case .down: orientation = .down
                case .left: orientation = .left
                case .right: orientation = .right
                case .upMirrored: orientation = .upMirrored
                case .downMirrored: orientation = .downMirrored
                case .leftMirrored: orientation = .leftMirrored
                case .rightMirrored: orientation = .rightMirrored
                default: orientation = .up
                }
                let request = VNRecognizeTextRequest { request, error in
                    if let error = error { promise.reject(error); return }
                    let observations = request.results as? [VNRecognizedTextObservation] ?? []
                    let fragments: [[String: Any]] = observations.compactMap { observation in
                        guard let text = observation.topCandidates(1).first else { return nil }
                        let r = observation.boundingBox
                        return ["text": text.string, "x": r.minX * 1000, "y": (1 - r.maxY) * 1000, "width": r.width * 1000, "height": r.height * 1000, "confidence": text.confidence, "angle": 0]
                    }
                    promise.resolve(["width": 1000, "height": 1000, "fragments": fragments])
                }
                request.recognitionLevel = .accurate
                request.usesLanguageCorrection = false
                try VNImageRequestHandler(cgImage: cgImage, orientation: orientation).perform([request])
            } catch { promise.reject(error) }
        }

        AsyncFunction("extractTextFromImage") { (url: URL, promise: Promise) in
            do {
                let imageData = try Data(contentsOf: url)
                let image = UIImage(data: imageData)
                guard let cgImage = image?.cgImage else {
                    throw Exception.init(name: "err", description: "err")
                }

                let requestHandler = VNImageRequestHandler(cgImage: cgImage)
                let request = VNRecognizeTextRequest { (request, error ) in
                    guard let observations = request.results as? [VNRecognizedTextObservation] else {
                        return promise.resolve([])
                    }

                    let recognizedTexts = observations.compactMap { observation in
                        observation.topCandidates(1).first?.string
                    }

                    promise.resolve(recognizedTexts)
                }

                try requestHandler.perform([request])
            } catch {
                promise.reject(error)
            }
        }
    }
}
