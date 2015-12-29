Rails.application.routes.draw do
  root 'answer_cards#index'
  get 'answer_cards/index'
  get '/join' => 'sessions#new', as: "join"
  delete '/close' => 'sessions#destroy', as: "close"
  resources :sessions, only: [:create, :destroy, :new]
end
