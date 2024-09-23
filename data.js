export const panoramas = [
    {
      imagePath: 'images/image1.jpeg',
      hotspots: [
        {
          position: { x: 5000, y: -1000, z: -5000 },
          size: 300,
          description: "lorem ipsum",
          title: "The Kalinga",
          hotspotOnly: true,
          sourceImage: "https://images.unsplash.com/photo-1515224526905-51c7d77c7bb8?ixlib=rb-0.3.5&s=9980646201037d28700d826b1bd096c4&auto=format&fit=crop&w=700&q=80",

        },
        {
          position: { x: -3000, y: 1000, z: 4000 },
          size: 300,
          description: "lorem ipsum 2",
          hotspotOnly: true,
          title: "The Kalinga 2",
          
        },
        {
            position: { x: -2000, y: 1000, z: 4000 },
            size: 300,

            hotspotOnly: false,
            index: 1,
        },

      ]
    },
    {
      imagePath: 'images/image4.jpeg',
      hotspots: [
        {
            position: { x: -2000, y: 1000, z: 4000 },
            size: 300,
            
            hotspotOnly: false,
            index: 0,
        },
      ]
    },
    {
        imagePath: 'images/image5.jpg',
        hotspots: [
          {
              position: { x: 5000, y: 1000, z: 5000 },
              size: 300,
              
              hotspotOnly: false,
              index: 1,
          },
        ]
      },
      {
        imagePath: 'images/image3.jpeg',
        hotspots: [
          {
              position: { x: 5000, y: 1000, z: 5000 },
              size: 300,
              
              hotspotOnly: false,
              index: 1,
          },
        ]
      }
  ];


