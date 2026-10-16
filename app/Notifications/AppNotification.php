<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

/**
 * In-app notification shown under the bell in the topbar.
 *
 * Title and body are English texts with `:placeholders`; they are translated
 * when displayed, so each person reads them in their own language:
 *
 *   $user->notify(new AppNotification('Your role was changed', 'You are now :role.', ['role' => 'Manager'], url: route('dashboard')));
 */
class AppNotification extends Notification
{
    use Queueable;

    /**
     * @param  array<string, string|int>  $params  Values for the placeholders in title and body.
     * @param  'info'|'success'|'warning'|'danger'  $tone
     */
    public function __construct(
        public string $title,
        public string $body = '',
        public array $params = [],
        public ?string $url = null,
        public string $tone = 'info',
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return list<string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array{title: string, body: string, params: array<string, string|int>, url: string|null, tone: string}
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => $this->title,
            'body' => $this->body,
            'params' => $this->params,
            'url' => $this->url,
            'tone' => $this->tone,
        ];
    }
}
