package expo.modules.maucuanwidget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.RemoteViews
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

class MikoWidgetProvider : AppWidgetProvider() {
  override fun onUpdate(context: Context, manager: AppWidgetManager, ids: IntArray) = refresh(context, manager, ids)

  companion object {
    fun refresh(context: Context, manager: AppWidgetManager, ids: IntArray) {
      val prefs = context.getSharedPreferences("maucuan_widget", Context.MODE_PRIVATE)
      val signedIn = prefs.getBoolean("signedIn", false)
      val name = if (signedIn) prefs.getString("name", "Macanmu") ?: "Macanmu" else "Teman Macan"
      val format = SimpleDateFormat("yyyy-MM-dd", Locale.US).apply { timeZone = TimeZone.getTimeZone("Asia/Jakarta") }
      val today = format.format(Date())
      val opened = prefs.getLong("opened", 0)
      val lastDay = format.format(Date(opened))
      val checked = signedIn && prefs.getString("checked", "") == today
      val waiting = signedIn && opened > 0 && today != lastDay && !checked
      val face = if (checked) "miko_widget_happy" else if (waiting) "miko_notification_face" else "miko_widget_idle"
      val lines = when {
        !signedIn -> Pair("Buka MauCuan untuk bertemu teman kecilmu.", "Buka MauCuan")
        checked -> Pair("Check-in hari ini beres. Tos dulu?", "Temui $name")
        waiting -> Pair("Aku di sini kalau kamu ingin mampir.", "Kembali ke kamar")
        else -> Pair("Kita cek hari ini, pelan-pelan?", "Cek hari ini")
      }
      for (id in ids) {
        val views = RemoteViews(context.packageName, R.layout.miko_widget)
        views.setTextViewText(R.id.miko_widget_name, name)
        views.setTextViewText(R.id.miko_widget_body, lines.first)
        views.setTextViewText(R.id.miko_widget_action, lines.second)
        views.setContentDescription(R.id.miko_widget_face, if (waiting) "$name ingin menyapa" else "$name teman macanmu")
        val drawable = context.resources.getIdentifier(face, "drawable", context.packageName)
        if (drawable != 0) views.setImageViewResource(R.id.miko_widget_face, drawable)
        val intent = context.packageManager.getLaunchIntentForPackage(context.packageName)
        if (intent != null) {
          intent.action = Intent.ACTION_VIEW
          intent.data = Uri.parse(if (checked || waiting) "maucuan://pet" else "maucuan://checkin")
          intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
          val click = PendingIntent.getActivity(context, id, intent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
          views.setOnClickPendingIntent(R.id.miko_widget_root, click)
          views.setOnClickPendingIntent(R.id.miko_widget_action, click)
        }
        manager.updateAppWidget(id, views)
      }
    }
  }
}
