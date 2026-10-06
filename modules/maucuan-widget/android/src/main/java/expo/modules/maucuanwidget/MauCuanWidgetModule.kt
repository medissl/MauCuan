package expo.modules.maucuanwidget

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.os.Build

class MauCuanWidgetModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("MauCuanWidget")

    Function("update") { name: String, opened: Double, checkedDay: String, signedIn: Boolean ->
      val context = appContext.reactContext ?: return@Function
      context.getSharedPreferences("maucuan_widget", Context.MODE_PRIVATE).edit()
        .putString("name", name.take(30)).putLong("opened", opened.toLong())
        .putString("checked", checkedDay).putBoolean("signedIn", signedIn).apply()
      val manager = AppWidgetManager.getInstance(context)
      MikoWidgetProvider.refresh(context, manager, manager.getAppWidgetIds(ComponentName(context, MikoWidgetProvider::class.java)))
    }
    Function("requestPin") {
      val context = appContext.reactContext ?: return@Function false
      val manager = AppWidgetManager.getInstance(context)
      if (Build.VERSION.SDK_INT >= 26 && manager.isRequestPinAppWidgetSupported) {
        manager.requestPinAppWidget(ComponentName(context, MikoWidgetProvider::class.java), null, null)
      } else false
    }
  }
}
