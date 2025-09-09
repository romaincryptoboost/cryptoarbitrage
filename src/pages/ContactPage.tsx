import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { companyInfo } from '../data/company';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageSquare,
  Send,
  CheckCircle,
  AlertCircle,
  Headphones,
  Users,
  Globe
} from 'lucide-react';

export function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    category: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setNotification({
        type: 'success',
        message: 'Votre message a été envoyé avec succès ! Nous vous répondrons dans les 24 heures.'
      });
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        category: 'general'
      });
      setIsSubmitting(false);
    }, 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const contactMethods = [
    {
      icon: Mail,
      title: "Email",
      value: companyInfo.contact.email,
      description: "Réponse sous 24h",
      action: `mailto:${companyInfo.contact.email}`
    },
    {
      icon: Phone,
      title: "Téléphone",
      value: companyInfo.contact.phone,
      description: "Lun-Ven 9h-18h",
      action: `tel:${companyInfo.contact.phone}`
    },
    {
      icon: MessageSquare,
      title: "Chat en Direct",
      value: "Support instantané",
      description: "24h/24 7j/7",
      action: "#"
    }
  ];

  const supportCategories = [
    { value: 'general', label: 'Question Générale' },
    { value: 'account', label: 'Gestion de Compte' },
    { value: 'investment', label: 'Investissements' },
    { value: 'technical', label: 'Support Technique' },
    { value: 'partnership', label: 'Partenariat' },
    { value: 'media', label: 'Presse & Médias' }
  ];

  const officeHours = [
    { day: 'Lundi - Vendredi', hours: '9h00 - 18h00' },
    { day: 'Samedi', hours: '10h00 - 16h00' },
    { day: 'Dimanche', hours: 'Fermé' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            Contactez-Nous
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-12">
            Notre équipe d'experts est là pour répondre à toutes vos questions sur 
            l'investissement crypto et nos services d'arbitrage.
          </p>

          {/* Quick Contact Methods */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {contactMethods.map((method) => {
              const Icon = method.icon;
              return (
                <Card key={method.title} hover className="p-6 text-center">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    {method.title}
                  </h3>
                  <p className="text-slate-900 dark:text-white font-medium mb-1">
                    {method.value}
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                    {method.description}
                  </p>
                  <a
                    href={method.action}
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    Contacter
                  </a>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Envoyez-nous un Message
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    Remplissez le formulaire ci-dessous et nous vous répondrons rapidement.
                  </p>
                </CardHeader>
                <CardContent>
                  {notification && (
                    <div className={`mb-6 p-4 rounded-lg border-l-4 ${
                      notification.type === 'success' 
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                        : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    }`}>
                      <div className="flex items-center space-x-2">
                        {notification.type === 'success' ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        )}
                        <span className={`text-sm ${
                          notification.type === 'success' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                        }`}>
                          {notification.message}
                        </span>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        name="firstName"
                        label="Prénom"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                      />
                      <Input
                        name="lastName"
                        label="Nom"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        name="email"
                        type="email"
                        label="Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                      <Input
                        name="phone"
                        type="tel"
                        label="Téléphone (optionnel)"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Catégorie
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        {supportCategories.map((category) => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <Input
                      name="subject"
                      label="Sujet"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    />

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Message
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={6}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Décrivez votre demande en détail..."
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      isLoading={isSubmitting}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Envoyer le Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              {/* Office Information */}
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      Notre Bureau
                    </h3>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {companyInfo.name}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400">
                      {companyInfo.contact.address.street}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400">
                      {companyInfo.contact.address.postalCode} {companyInfo.contact.address.city}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400">
                      {companyInfo.contact.address.country}
                    </p>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                      Informations légales :
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {companyInfo.legal.companyNumber}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {companyInfo.legal.license}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Office Hours */}
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      Horaires d'Ouverture
                    </h3>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {officeHours.map((schedule) => (
                      <div key={schedule.day} className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">
                          {schedule.day}
                        </span>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {schedule.hours}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Headphones className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                        Support client 24h/24 7j/7 disponible en ligne
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Support Stats */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Notre Support
                  </h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Temps de réponse moyen</span>
                    <Badge variant="success">< 2 heures</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Satisfaction client</span>
                    <Badge variant="success">98.5%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Langues supportées</span>
                    <Badge variant="info">5 langues</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Disponibilité</span>
                    <Badge variant="success">24h/24 7j/7</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-800">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Questions Fréquentes
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              Trouvez rapidement les réponses aux questions les plus courantes
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                question: "Comment puis-je ouvrir un compte ?",
                answer: "L'ouverture de compte est simple et rapide. Cliquez sur 'S'inscrire', remplissez le formulaire avec vos informations personnelles, vérifiez votre email, et votre compte sera activé immédiatement."
              },
              {
                question: "Quels documents sont nécessaires pour la vérification ?",
                answer: "Pour la vérification KYC, vous aurez besoin d'une pièce d'identité valide (carte d'identité, passeport) et d'un justificatif de domicile récent (facture, relevé bancaire)."
              },
              {
                question: "Combien de temps prend un retrait ?",
                answer: "Les retraits sont traités sous 24 heures ouvrées. Le délai de réception dépend de votre banque et peut varier de 1 à 3 jours ouvrés."
              },
              {
                question: "Puis-je modifier mon plan d'investissement ?",
                answer: "Oui, vous pouvez modifier votre plan à tout moment depuis votre tableau de bord. Les modifications prennent effet au prochain cycle de calcul."
              }
            ].map((faq, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    {faq.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Vous ne trouvez pas la réponse à votre question ?
            </p>
            <Button variant="outline">
              Voir Toutes les FAQ
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}