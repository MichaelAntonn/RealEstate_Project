<?php

namespace App\Services;

use App\Models\Property;
use App\Models\PropertyMedia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;
use Symfony\Component\HttpFoundation\File\Exception\UploadException;

class PropertyMediaService
{
    private array $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'avi'];
    private int $maxFileSize = 20480; // 20MB in KB

    public function handleUpload(Property $property, array $files): array
    {
        $uploadedMedia = [];
    
    $basePath = 'property_media/' . $property->id . '/';

    foreach ($files as $file) {
        $this->validateFile($file);
        
        $path = $file->store($basePath, 'public');
        
        $mediaType = $this->determineMediaType($file);
        
        $media = PropertyMedia::create([
            'PropertyID' => $property->id,
            'MediaURL' => $path,
            'MediaType' => $mediaType,
        ]);

        $uploadedMedia[] = $media;
        
        $this->updateCoverImageIfNeeded($property, $mediaType, $path);
    }
    
    return $uploadedMedia;
    }

    public function deleteMedia(Property $property, PropertyMedia $media): void
    {
        $isCoverImage = ($property->cover_image === $media->MediaURL);
        
        Storage::disk('public')->delete($media->MediaURL);
        $media->delete();

        if ($isCoverImage) {
            $this->updateCoverImage($property);
        }
    }

    private function validateFile(UploadedFile $file): void
    {
        $extension = strtolower($file->getClientOriginalExtension());
        
        if (!in_array($extension, $this->allowedExtensions)) {
            throw new UploadException('Invalid file type. Only images and videos are allowed.');
        }
        
        if ($file->getSize() > ($this->maxFileSize * 1024)) {
            throw new UploadException('File size exceeds maximum allowed size of 20MB.');
        }
    }

    private function determineMediaType(UploadedFile $file): string
    {
        $extension = strtolower($file->getClientOriginalExtension());
        return in_array($extension, ['mp4', 'mov', 'avi']) ? 'video' : 'image';
    }

    private function updateCoverImageIfNeeded(Property $property, string $mediaType, string $path): void
    {
        if ($mediaType === 'image' && empty($property->cover_image)) {
            $property->cover_image = $path;
            $property->save();
        }
    }

    private function updateCoverImage(Property $property): void
    {
        $newCoverImage = PropertyMedia::where('PropertyID', $property->id)
            ->where('MediaType', 'image')
            ->first();

        $property->cover_image = $newCoverImage ? $newCoverImage->MediaURL : null;
        $property->save();
    }
}