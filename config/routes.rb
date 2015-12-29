Rails.application.routes.draw do
  root 'sessions#new'
  get '/join' => 'sessions#new', as: "join"
  delete '/close' => 'sessions#destroy', as: "close"
  resources :sessions, only: [:create, :destroy, :new]
end
