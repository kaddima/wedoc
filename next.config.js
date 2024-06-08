/** @type {import('next').NextConfig} */

const nextConfig = {
    // experimental:{
    //   serverActions:true
    // },
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'ckeelqgchtllpvymrhic.supabase.co',
          pathname: '**',
        },
      ],
      // domains: [''],
    },
  };

module.exports = nextConfig  
