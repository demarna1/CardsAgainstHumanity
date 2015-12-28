Rails.application.routes.draw do
  root 'sessions#new'
  get 'join' => 'sessions#new'
  post 'join' => 'sessions#create'
  delete 'close' => 'sessions#destroy'
end
