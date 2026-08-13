/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'www.cnet.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'crests.football-data.org',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'upload.wikimedia.org',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'media.wired.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 's.yimg.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'platform.theverge.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'media.api-sports.io',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'npr.brightspotcdn.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'npr-brightspot.s3.amazonaws.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'www.thesportsdb.com',
                port: '',
                pathname: '/images/**',
            },
            {
                protocol: 'https',
                hostname: 'r2.thesportsdb.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'footballdata.io',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'imgs.search.brave.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'i.insider.com',
                port: '',
                pathname: '/**',
            },
        ],

    },
};

export default nextConfig;