package expo.modules.textextractor

import android.net.Uri
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.latin.TextRecognizerOptions
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.File

class ExpoTextExtractorModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoTextExtractor")

    Constants(
      "isSupported" to true
    )

    AsyncFunction("extractReceiptLayout") { uriString: String, promise: Promise ->
      try {
        val context = appContext.reactContext!!
        val uri = if (uriString.startsWith("content://") || uriString.startsWith("file://")) Uri.parse(uriString) else Uri.fromFile(File(uriString))
        val image = InputImage.fromFilePath(context, uri)
        val recognizer = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS)
        recognizer.process(image).addOnSuccessListener { text ->
          val fragments = text.textBlocks.flatMap { it.lines }.mapNotNull { line ->
            val rect = line.boundingBox ?: return@mapNotNull null
            val points = line.cornerPoints
            val angle = if (points != null && points.size >= 2) kotlin.math.atan2((points[1].y - points[0].y).toDouble(), (points[1].x - points[0].x).toDouble()) else 0.0
            mapOf("text" to line.text, "x" to rect.left.toDouble(), "y" to rect.top.toDouble(), "width" to rect.width().toDouble(), "height" to rect.height().toDouble(), "angle" to angle)
          }
          promise.resolve(mapOf("width" to image.width, "height" to image.height, "fragments" to fragments))
          recognizer.close()
        }.addOnFailureListener { error ->
          recognizer.close()
          promise.reject(CodedException("OCR_ERROR", error))
        }
      } catch (error: Exception) {
        promise.reject(CodedException("OCR_ERROR", error.message ?: "Image unavailable", error))
      }
    }

    AsyncFunction("extractTextFromImage") { uriString: String, promise: Promise ->
      try {
        val context = appContext.reactContext!!
        val uri = if (uriString.startsWith("content://")) {
          Uri.parse(uriString)
        } else {
          val file = File(uriString)
          if (!file.exists()) {
            throw Exception("File not found: $uriString")
          }
          Uri.fromFile(file)
        }

        val inputImage = InputImage.fromFilePath(context, uri)
        val recognizer = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS)

        recognizer.process(inputImage)
          .addOnSuccessListener { visionText ->
            val recognizedTexts = visionText.textBlocks.map { it.text }

            promise.resolve(recognizedTexts)
          }
          .addOnFailureListener { error ->
            promise.reject(CodedException("err", error))
          }
      } catch (error: Exception) {
        promise.reject(CodedException("UNKNOWN_ERROR", error.message ?: "Unknown error", error))
      }
    }
  }
}
