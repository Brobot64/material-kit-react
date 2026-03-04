import { Helmet as ReactHelmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

// ----------------------------------------------------------------------

type Props = {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: string;
};

export function Helmet({ title, description, keywords, image, url, type = 'website' }: Props) {
    const pageTitle = title ? `${title} | ${CONFIG.appName}` : CONFIG.appName;
    const siteName = CONFIG.appName;
    const defaultDescription = 'Tajarah - The ultimate business management platform for outlets, inventory, and sales.';
    const defaultKeywords = 'business, management, sales, outlet, inventory, tajarah, pos';
    const protocol = window.location.protocol;
    const host = window.location.host;
    const canonicalUrl = url || `${protocol}//${host}${window.location.pathname}`;

    return (
        <ReactHelmet>
            {/* Primary Meta Tags */}
            <title>{pageTitle}</title>
            <meta name="title" content={pageTitle} />
            <meta name="description" content={description || defaultDescription} />
            <meta name="keywords" content={keywords || defaultKeywords} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:title" content={pageTitle} />
            <meta property="og:description" content={description || defaultDescription} />
            {image && <meta property="og:image" content={image} />}
            <meta property="og:site_name" content={siteName} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={canonicalUrl} />
            <meta property="twitter:title" content={pageTitle} />
            <meta property="twitter:description" content={description || defaultDescription} />
            {image && <meta property="twitter:image" content={image} />}

            {/* Canonical Link */}
            <link rel="canonical" href={canonicalUrl} />

            {/* Additional Meta Tags */}
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <meta name="theme-color" content="#000000" />
            <meta name="robots" content="index, follow" />
        </ReactHelmet>
    );
}
