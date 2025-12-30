import {enableProdMode} from '@angular/core';
import {AppModule} from '~/app.module';
import {ConfigurationService, fetchConfigOutSideAngular} from '@common/shared/services/configuration.service';
import {updateHttpUrlBaseConstant} from '~/app.constants';
import {Environment} from './environments/base';
import {platformBrowser} from '@angular/platform-browser';
import {APP_BASE_HREF} from '@angular/common';
const environment = ConfigurationService.globalEnvironment;

if (environment.production) {
  enableProdMode();
}

(async () => {
  let configData = {} as Environment;
  try {
    configData = await fetchConfigOutSideAngular();
    (window as any).configuration = configData;
  } finally {
    const baseHref = (window as any).__env.subPath || '' as string;
    // Use configData.apiBaseUrl if provided (from configuration.json), otherwise fall back to environment.apiBaseUrl
    const effectiveApiBaseUrl = configData.apiBaseUrl || environment.apiBaseUrl;
    // Only prepend baseHref if apiBaseUrl is not already an absolute path (doesn't start with /)
    const needsBaseHref = baseHref && !baseHref.startsWith('${') && !effectiveApiBaseUrl.startsWith('/');
    updateHttpUrlBaseConstant({...environment, ...configData, ...(needsBaseHref && {apiBaseUrl: baseHref + effectiveApiBaseUrl})});

    // Calculate effective base href for router:
    // 1. Use explicit baseHref from configuration.json if set
    // 2. Otherwise, use subPath with proper formatting (add leading/trailing slashes)
    let effectiveBaseHref = configData.baseHref;
    if (!effectiveBaseHref && baseHref) {
      effectiveBaseHref = baseHref.startsWith('/') ? baseHref : '/' + baseHref;
      if (!effectiveBaseHref.endsWith('/')) {
        effectiveBaseHref += '/';
      }
    }

    await platformBrowser([
      {provide: APP_BASE_HREF, useValue: effectiveBaseHref ?? ''}
    ]).bootstrapModule(AppModule);
  }
})();
