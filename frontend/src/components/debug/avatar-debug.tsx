'use client';

import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

/**
 * Avatar Debug Component
 * 
 * This component helps debug avatar display issues by showing:
 * - The raw user data structure
 * - The image URL being used
 * - The actual Avatar component
 * - Image loading status
 */
export function AvatarDebug() {
  const { user } = useAuth();

  const imageUrl = user?.image?.media?.link || '/default-avatar-profile-picture-male-icon.png';
  const fallbackText = user?.first_name?.charAt(0) || user?.email?.charAt(0) || 'U';

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Avatar Debug Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Display */}
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage 
              src={imageUrl}
              alt={`${user?.first_name} ${user?.last_name}` || 'User'}
              onLoad={() => console.log('✅ Avatar image loaded successfully:', imageUrl)}
              onError={(e) => console.error('❌ Avatar image failed to load:', imageUrl, e)}
            />
            <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl">
              {fallbackText}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{user?.first_name} {user?.last_name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        {/* Image URL Information */}
        <div className="space-y-2">
          <h3 className="font-semibold">Image URL</h3>
          <div className="bg-muted p-3 rounded-md">
            <code className="text-sm break-all">{imageUrl}</code>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Status:</span>
            <img 
              src={imageUrl} 
              alt="test" 
              className="w-8 h-8 rounded-full"
              onLoad={() => console.log('✅ Test image loaded')}
              onError={() => console.error('❌ Test image failed')}
            />
          </div>
        </div>

        {/* User Data Structure */}
        <div className="space-y-2">
          <h3 className="font-semibold">User Image Data Structure</h3>
          <div className="bg-muted p-3 rounded-md overflow-auto max-h-96">
            <pre className="text-xs">
              {JSON.stringify({
                'user.image': user?.image,
                'user.image.media': user?.image?.media,
                'user.image.media.link': user?.image?.media?.link,
                'user.image.media.path': user?.image?.media?.path,
              }, null, 2)}
            </pre>
          </div>
        </div>

        {/* Full User Object */}
        <details className="space-y-2">
          <summary className="font-semibold cursor-pointer">Full User Object (Click to expand)</summary>
          <div className="bg-muted p-3 rounded-md overflow-auto max-h-96 mt-2">
            <pre className="text-xs">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        </details>

        {/* Recommendations */}
        <div className="space-y-2">
          <h3 className="font-semibold">Troubleshooting Steps</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Check browser console for image loading errors</li>
            <li>Verify the image URL is accessible (try opening in new tab)</li>
            <li>Check if CORS headers are properly configured on the backend</li>
            <li>Ensure the image URL is not double-encoded</li>
            <li>Verify the API is returning the correct image structure</li>
            <li>Check if the image file exists on the server</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
