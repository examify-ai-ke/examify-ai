/**
 * Google Analytics gtag.js Type Definitions
 * 
 * This file provides TypeScript type definitions for the Google Analytics
 * gtag.js library to enable type-safe analytics tracking.
 */

declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'set' | 'js',
      targetId: string | Date,
      config?: Gtag.ConfigParams | Gtag.EventParams | Gtag.CustomParams
    ) => void;
    dataLayer: any[];
  }
}

declare namespace Gtag {
  interface ConfigParams {
    page_path?: string;
    page_title?: string;
    page_location?: string;
    send_page_view?: boolean;
    anonymize_ip?: boolean;
    cookie_domain?: string;
    cookie_expires?: number;
    cookie_prefix?: string;
    cookie_update?: boolean;
    cookie_flags?: string;
    user_id?: string;
    [key: string]: any;
  }

  interface EventParams {
    event_category?: string;
    event_label?: string;
    value?: number;
    non_interaction?: boolean;
    [key: string]: any;
  }

  interface CustomParams {
    [key: string]: any;
  }

  // Common event names
  type EventNames =
    | 'page_view'
    | 'screen_view'
    | 'click'
    | 'exception'
    | 'login'
    | 'sign_up'
    | 'search'
    | 'select_content'
    | 'share'
    | 'view_item'
    | 'view_item_list'
    | 'add_to_cart'
    | 'remove_from_cart'
    | 'begin_checkout'
    | 'purchase'
    | 'refund'
    | 'file_download'
    | 'form_start'
    | 'form_submit'
    | string; // Allow custom event names
}

export {};
