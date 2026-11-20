// Runs after `npx cap add android`.
// Adds a small native bridge so window.print() style PDF export works inside the Android WebView.
const fs = require('fs');
const path = require('path');

const appId = 'com.grassfarm.pay';
const dir = path.join('android', 'app', 'src', 'main', 'java', ...appId.split('.'));
fs.mkdirSync(dir, { recursive: true });

const java = `package ${appId};

import android.os.Bundle;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        final WebView wv = getBridge().getWebView();
        wv.addJavascriptInterface(new Object() {
            @JavascriptInterface
            public void print(final String name) {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        PrintManager pm = (PrintManager) getSystemService(PRINT_SERVICE);
                        PrintDocumentAdapter adapter = wv.createPrintDocumentAdapter(name);
                        pm.print(name, adapter, new PrintAttributes.Builder().build());
                    }
                });
            }
        }, "AndroidPrint");
    }
}
`;
fs.writeFileSync(path.join(dir, 'MainActivity.java'), java);
console.log('Patched MainActivity.java in', dir);
