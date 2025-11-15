import React, { useEffect, useState } from 'react';
import { ContentItem } from '../types';
import { supabase } from '../src/integrations/supabase/client';

interface ViewContentModalProps {
  item: ContentItem;
  onClose: () => void;
}

const ViewContentModal: React.FC<ViewContentModalProps> = ({ item, onClose }) => {
  const [mediaItems, setMediaItems] = useState<{ type: string; url: string; order: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMedia = async () => {
      try {
        const { data, error } = await supabase
          .from('media')
          .select('media_type, storage_path, display_order')
          .eq('content_item_id', item.id)
          .order('display_order', { ascending: true });

        if (error) {
          console.error('Error loading media:', error);
        } else if (data) {
          console.log('Media data from database:', data);
          
          // Check if storage_path is already a full URL or just a path
          const mediaWithUrls = data.map((m) => {
            let url = m.storage_path;
            
            // If it's not a full URL, convert it using getPublicUrl
            if (!m.storage_path.startsWith('http')) {
              const { data: urlData } = supabase.storage
                .from('content-media')
                .getPublicUrl(m.storage_path);
              url = urlData.publicUrl;
            }
            
            console.log('Storage path:', m.storage_path, 'Final URL:', url);
            
            return {
              type: m.media_type,
              url: url,
              order: m.display_order
            };
          });
          
          setMediaItems(mediaWithUrls);
        }
      } catch (error) {
        console.error('Error loading media:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!item.externalLink) {
      loadMedia();
    } else {
      setLoading(false);
    }
  }, [item.id, item.externalLink]);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-neutral-800 rounded-xl shadow-2xl p-6 w-full max-w-2xl transform transition-all" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">{item.title}</h2>
            <button onClick={onClose} className="text-neutral-400 hover:text-white text-3xl">&times;</button>
        </div>
        
        <div className="bg-neutral-900 rounded-lg p-4 max-h-[70vh] overflow-y-auto">
            {item.externalLink ? (
                <div className="text-center py-8">
                    <p className="text-neutral-300 mb-4">This content is hosted externally.</p>
                    <a 
                        href={item.externalLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-block bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3 px-6 rounded-lg transition"
                    >
                        Access Content Now
                    </a>
                </div>
            ) : loading ? (
                <div className="text-center py-8">
                    <p className="text-neutral-400">Loading media...</p>
                </div>
            ) : (
                <div className="space-y-4">
                   <p className="text-sm text-neutral-400 text-center">
                       Displaying {mediaItems.filter(m => m.type === 'image').length} image(s) and {mediaItems.filter(m => m.type === 'video').length} video(s).
                   </p>
                   {mediaItems.length === 0 ? (
                       <p className="text-center text-neutral-500 py-8">No media found for this content.</p>
                   ) : (
                        mediaItems.map((media, index) => (
                            media.type === 'image' ? (
                                <img 
                                    key={`media-${index}`} 
                                    src={media.url} 
                                    alt={`${item.title} - ${index+1}`} 
                                    className="w-full h-auto object-cover rounded-lg"
                                    onError={(e) => {
                                      console.error('Image failed to load:', media.url);
                                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iIzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBGYWlsZWQgdG8gTG9hZDwvdGV4dD48L3N2Zz4=';
                                    }}
                                    onLoad={() => console.log('Image loaded successfully:', media.url)}
                                />
                            ) : (
                                <video 
                                    key={`media-${index}`} 
                                    src={media.url} 
                                    controls 
                                    className="w-full h-auto rounded-lg"
                                    onError={(e) => {
                                      console.error('Video failed to load:', media.url);
                                    }}
                                    onLoadedData={() => console.log('Video loaded successfully:', media.url)}
                                >
                                    Your browser does not support the video tag.
                                </video>
                            )
                        ))
                   )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ViewContentModal;
