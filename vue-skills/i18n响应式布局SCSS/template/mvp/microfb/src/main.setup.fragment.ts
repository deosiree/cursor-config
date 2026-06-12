// microfb MVP：在 app.use(i18n) 之后注册 locale-layout
import { setupLocaleLayout } from "@/plugins/locale-layout";

app.use(i18n);
setupLocaleLayout(app);
